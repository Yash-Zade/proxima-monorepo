package com.teamarc.proxima.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class OnBoardNewCollege {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String name;
    @Column(columnDefinition = "TEXT")
    private String address;
    private String email;
    private String website;
}
