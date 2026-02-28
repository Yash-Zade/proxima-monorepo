package com.teamarc.proxima.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class College {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String email;
    private String website;

    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    private List<Student> students;

    @OneToOne
    private User user;
}
