package com.teamarc.proxima.entity;

import com.teamarc.proxima.entity.enums.MassHiringStatus;
import jakarta.persistence.*;
import lombok.*;


@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class MassHiringRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;
    private Long requiredStudents;

    @Enumerated(EnumType.STRING)
    private MassHiringStatus status;

    @ManyToOne
    private College college;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private Employer employer;

}
