package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepo extends JpaRepository<ChatRoom, UUID> {
    Optional<ChatRoom> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);
}