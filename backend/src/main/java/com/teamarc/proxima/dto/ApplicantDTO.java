package com.teamarc.proxima.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplicantDTO {

    private Long applicantId;

    private String resume;

    private UserDTO user;

    @JsonIgnoreProperties("applicant")
    private List<JobApplicationDTO> jobApplications;

    private List<String> skills;

    private List<String> preferredLocations;

    private List<String> certifiedSkills;

}
