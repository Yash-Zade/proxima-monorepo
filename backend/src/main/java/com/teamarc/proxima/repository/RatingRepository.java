package com.teamarc.proxima.repository;

import com.teamarc.proxima.dto.RatingDTO;
import com.teamarc.proxima.entity.Mentor;
import com.teamarc.proxima.entity.Rating;
import com.teamarc.proxima.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findBySession(Session session);

    List<Rating> findByMentor(Mentor mentor);

    Optional<RatingDTO> findBySession_SessionId(Long sessionId);
}
