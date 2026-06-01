package com.teamarc.proxima.dto;

import com.teamarc.proxima.entity.Employer;
import com.teamarc.proxima.entity.enums.JobStatus;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class JobDTO {

    private Long jobId;

    @NotEmpty(message = "Job title cannot be empty")
    private String title;

    private EmployerDTO postedBy;

    private String description;

    @NotEmpty(message = "Job location cannot be empty")
    private String location;

    private List<String> skillsRequired;

    private JobStatus jobStatus;

    private String postedDate;

}
