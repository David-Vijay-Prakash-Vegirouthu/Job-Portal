package com.jobportal.backend.controller;

import com.jobportal.backend.model.JobApplication;
import com.jobportal.backend.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository applicationRepository;

    // Absolute path inside Docker container (WORKDIR is /app)
    private static final String UPLOAD_DIR = "/app/uploads/";

    // ── Apply to a job ───────────────────────────────────────────────────────
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

            // Allow only PDF
            String contentType = resume.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Only PDF files are allowed.");
                return ResponseEntity.badRequest().body(err);
            }

            // Save file to /app/uploads/ inside the container
            String fileName = System.currentTimeMillis() + "_" + resume.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, resume.getBytes());

            // Save application record to DB
            JobApplication application = new JobApplication();
            application.setJobId(jobId);
            application.setApplicantId(applicantId);
            application.setApplicantName(applicantName);
            application.setApplicantEmail(applicantEmail);
            application.setMessage(message);
            application.setResumePath(fileName);

            JobApplication saved = applicationRepository.save(application);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Error uploading file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    // ── Get all applicants for a specific job (only the job owner calls this)
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicants(@PathVariable Long jobId) {
        List<JobApplication> applicants = applicationRepository.findByJobId(jobId);
        return ResponseEntity.ok(applicants);
    }
}
