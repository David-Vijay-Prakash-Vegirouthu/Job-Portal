package com.jobportal.backend.controller;

import com.jobportal.backend.model.JobApplication;
import com.jobportal.backend.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository applicationRepository;

    // ── Apply to a job ───────────────────────────────────────────────────────
    // Body: { jobId, applicantId, applicantName, applicantEmail, message }
    @PostMapping
public ResponseEntity<?> apply(
        @RequestParam Long jobId,
        @RequestParam Long applicantId,
        @RequestParam String applicantName,
        @RequestParam String applicantEmail,
        @RequestParam(required = false) String message,
        @RequestParam("resume") MultipartFile resume
) {
    try {
        // Prevent duplicate applications
        if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicantId)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "You have already applied for this job.");
            return ResponseEntity.status(409).body(err);
        }

        // ✅ Allow only PDF
        if (!resume.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body("Only PDF files allowed");
        }

        // ✅ Save file
        String uploadDir = "uploads/";
        String fileName = System.currentTimeMillis() + "_" + resume.getOriginalFilename();

        java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, fileName);
        java.nio.file.Files.createDirectories(filePath.getParent());
        java.nio.file.Files.write(filePath, resume.getBytes());

        // ✅ Save to DB
        JobApplication application = new JobApplication();
        application.setJobId(jobId);
        application.setApplicantId(applicantId);
        application.setApplicantName(applicantName);
        application.setApplicantEmail(applicantEmail);
        application.setMessage(message);
        application.setResumePath(fileName); // store only filename

        JobApplication saved = applicationRepository.save(application);

        return ResponseEntity.ok(saved);

    } catch (Exception e) {
        return ResponseEntity.internalServerError().body("Error uploading file: " + e.getMessage());
    }
}

    // ── Get all applicants for a specific job (only the job owner calls this)
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicants(@PathVariable Long jobId) {
        List<JobApplication> applicants = applicationRepository.findByJobId(jobId);
        return ResponseEntity.ok(applicants);
    }
}