package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.OnBoardNewStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OnBoardNewStudentRepository extends JpaRepository<OnBoardNewStudent, Long> {
    List<OnBoardNewStudent> findByCollegeId(Long collegeId);
}
