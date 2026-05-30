package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.ForumMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ForumMessageRepo extends JpaRepository<ForumMessage, UUID> {
    java.util.List<ForumMessage> findByForumIdOrderByTimestampAsc(Long forumId);
}
