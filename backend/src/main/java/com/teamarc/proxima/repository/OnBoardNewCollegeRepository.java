package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.OnBoardNewCollege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnBoardNewCollegeRepository extends JpaRepository<OnBoardNewCollege, Long> {
}