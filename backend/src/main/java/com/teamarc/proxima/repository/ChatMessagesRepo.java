package com.teamarc.proxima.repository;

import com.teamarc.proxima.entity.ChatMessages;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChatMessagesRepo extends JpaRepository<ChatMessages, UUID> {
}