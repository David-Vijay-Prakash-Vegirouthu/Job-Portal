package com.jobportal.backend.repository;

import com.jobportal.backend.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    // Get all applicants for a specific job
    List<JobApplication> findByJobId(Long jobId);

    // Get all applications submitted by a specific user
    List<JobApplication> findByApplicantId(Long applicantId);

    // Check if a user already applied to a job (prevent duplicate applications)
    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);
}