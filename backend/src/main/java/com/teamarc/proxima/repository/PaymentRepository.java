package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.Payment;
import com.teamarc.proxima.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findBySession(Session session);
}
