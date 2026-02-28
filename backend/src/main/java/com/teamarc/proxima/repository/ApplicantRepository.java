package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.Applicant;
import com.teamarc.proxima.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findByUser(User user);
}
