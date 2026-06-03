package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.ChatMessages;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ChatMessagesRepo extends JpaRepository<ChatMessages, UUID> {
    List<ChatMessages> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(Long senderId, Long receiverId, Long senderId2, Long receiverId2);

    @Query("SELECT DISTINCT CASE WHEN c.senderId = :userId THEN c.receiverId ELSE c.senderId END FROM ChatMessages c WHERE c.senderId = :userId OR c.receiverId = :userId")
    List<Long> findDistinctChatPartners(@Param("userId") Long userId);
}