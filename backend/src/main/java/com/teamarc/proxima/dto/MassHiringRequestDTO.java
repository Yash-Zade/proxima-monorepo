package com.teamarc.proxima.dto;

import com.teamarc.proxima.entity.College;
import com.teamarc.proxima.entity.Employer;
import com.teamarc.proxima.entity.enums.MassHiringStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class MassHiringRequestDTO {


    private Long id;
    private String description;
    private Long requiredStudents;
    private String status;
    private Long college;
    private Long employer;
}
