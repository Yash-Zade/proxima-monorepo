package com.teamarc.proxima.entity;

import com.teamarc.proxima.entity.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.proxy.HibernateProxy;

import java.util.List;
import java.util.Objects;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    private String title;
    private String description;
    private String location;

    @ElementCollection
    private List<String> skillsRequired;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private Employer postedBy;

    @OneToMany(mappedBy = "job")
    private List<JobApplication> jobApplications;

    @Enumerated(EnumType.STRING)
    private JobStatus jobStatus;

    private String company;

    @CreationTimestamp
    private String postedDate;


}
