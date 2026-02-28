package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.OnboardNewEmployer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnboardNewEmployerRepository extends JpaRepository<OnboardNewEmployer, Long> {
}