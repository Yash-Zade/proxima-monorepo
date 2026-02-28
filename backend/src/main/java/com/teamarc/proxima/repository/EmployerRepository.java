package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.Employer;
import com.teamarc.proxima.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, Long> {
    Optional<Employer> findByUser(User user);
}
