package com.teamarc.proxima.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.teamarc.proxima.entity.enums.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobApplicationDTO {
    private Long applicationId;
    private Long jobId;

    @JsonIgnoreProperties("jobApplications")
    private ApplicantDTO applicant;
    private ApplicationStatus applicationStatus;
    private LocalDateTime appliedDate;
}