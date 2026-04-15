package com.jobportal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.JobRepository;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    // ── Create ──────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> addJob(@RequestBody Job job) {
        if (job.getUserId() == null) {
            return ResponseEntity.badRequest().body(errorMap("userId is required"));
        }
        return ResponseEntity.ok(jobRepository.save(job));
    }

    // ── Read ────────────────────────────────────────────────────────────────
    @GetMapping
    public List<Job> getJobs() {
        return jobRepository.findAll();
    }

    // ── Update ──────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestBody Job updatedJob) {

        try {
            Job job = jobRepository.findById(id).orElse(null);
            if (job == null) {
                return ResponseEntity.status(404).body(errorMap("Job not found"));
            }

            boolean isLegacy = (job.getUserId() == null);
            boolean isOwner = (userId != null && userId.equals(job.getUserId()));

            if (!isLegacy && !isOwner) {
                return ResponseEntity.status(403).body(errorMap("You are not authorised to edit this job"));
            }

            if (isLegacy && userId != null) {
                job.setUserId(userId);
            }

            job.setTitle(updatedJob.getTitle());
            job.setCompany(updatedJob.getCompany());
            job.setLocation(updatedJob.getLocation());
            job.setDescription(updatedJob.getDescription());

            return ResponseEntity.ok(jobRepository.save(job));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(errorMap("Update failed: " + e.getMessage()));
        }
    }

    // ── Delete ──────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {

        try {
            Job job = jobRepository.findById(id).orElse(null);
            if (job == null) {
                return ResponseEntity.status(404).body(errorMap("Job not found"));
            }

            boolean isLegacy = (job.getUserId() == null);
            boolean isOwner = (userId != null && userId.equals(job.getUserId()));

            if (!isLegacy && !isOwner) {
                return ResponseEntity.status(403).body(errorMap("You are not authorised to delete this job"));
            }

            jobRepository.deleteById(id);

            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Job deleted successfully");
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            // Print full stack trace to Spring Boot console so you can see the exact cause
            e.printStackTrace();
            return ResponseEntity.status(500).body(errorMap("Delete failed: " + e.getMessage()));
        }
    }

    // ── Helper ──────────────────────────────────────────────────────────────
    private Map<String, String> errorMap(String message) {
        Map<String, String> map = new HashMap<>();
        map.put("error", message);
        return map;
    }
}
