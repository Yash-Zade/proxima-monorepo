package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.MassHiringRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MassHiringRequestRepository extends JpaRepository<MassHiringRequest, Long> {

    List<MassHiringRequest> findByCollegeId(Long id);

    List<MassHiringRequest> findByEmployer_EmployerId(Long employerId);
}
