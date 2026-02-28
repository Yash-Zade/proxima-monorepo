package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.College;
import com.teamarc.proxima.entity.Student;
import com.teamarc.proxima.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByName(String collegeName);

    Optional<College> findByUser(User user);

    List<Student> findStudentsById(Long id);
}
