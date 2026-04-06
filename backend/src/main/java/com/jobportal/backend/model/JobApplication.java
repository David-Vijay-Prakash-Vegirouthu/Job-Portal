package com.jobportal.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which job was applied to
    private Long jobId;

    // Applicant's details (user2 who clicked Apply)
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String message;       // optional cover note

    private LocalDateTime appliedAt;
    private String resumePath;

    @PrePersist
    public void prePersist() {
        this.appliedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Long getId() { return id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public String getResumePath() { return resumePath; }
public void setResumePath(String resumePath) { this.resumePath = resumePath; }
}