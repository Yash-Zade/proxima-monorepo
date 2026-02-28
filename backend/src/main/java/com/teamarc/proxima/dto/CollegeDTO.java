package com.teamarc.proxima.dto;

import com.teamarc.proxima.entity.Student;
import lombok.Data;

import java.util.List;

@Data
public class CollegeDTO {
    private Long id;

    private String name;
    private String address;
    private String email;
    private String website;
    private List<Student> students;
}
