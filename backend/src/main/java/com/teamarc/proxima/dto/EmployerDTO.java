package com.teamarc.proxima.dto;

import lombok.Data;

@Data
public class EmployerDTO {

    private Long employerId;
    private String companyName;
    private String companyWebsite;
    private UserDTO user;
}
