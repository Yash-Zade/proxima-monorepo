package com.teamarc.proxima.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.List;

@Data
public class CollegeDTO {
    private Long id;

    private String name;
    private String address;
    private String email;
    private String website;

    // Raw entity reference removed — students are fetched separately via /college/student
    @JsonIgnore
    private List<Object> students;

    // Used by the college dashboard profile to list authorized employers
    private List<EmployerDTO> allowedEmployers;
}
