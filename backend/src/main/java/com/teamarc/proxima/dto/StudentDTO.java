package com.teamarc.proxima.dto;

import lombok.Data;

@Data
public class StudentDTO {
    Long id;
    UserDTO user;
    String collegeName;
}
