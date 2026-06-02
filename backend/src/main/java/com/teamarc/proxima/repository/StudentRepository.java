package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.Student;
import com.teamarc.proxima.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    List<Student> findByCollegeId(Long collegeId);
}
