package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.OnboardNewMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnboardNewMentorRepository extends JpaRepository<OnboardNewMentor, Long> {
}