package com.teamarc.proxima.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamarc.proxima.entity.ChatMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final com.teamarc.proxima.repository.ChatMessagesRepo chatMessagesRepo;
    private final com.teamarc.proxima.repository.ForumMessageRepo forumMessageRepo;

    public java.util.List<com.teamarc.proxima.entity.ForumMessage> getForumHistory(Long forumId) {
        return forumMessageRepo.findByForumIdOrderByTimestampAsc(forumId);
    }

    public java.util.List<ChatMessages> getChatHistory(Long senderId, Long receiverId) {
        return chatMessagesRepo.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                senderId, receiverId, senderId, receiverId
        );
    }

    public String sendPrivateMessage(ChatMessages chatMessages) {
        try {
            String payload = objectMapper.writeValueAsString(chatMessages);
            rabbitTemplate.convertAndSend("direct-chat-queue", payload);
            log.info("Successfully published direct message to RabbitMQ queue for sender: {} and receiver: {}",
                    chatMessages.getSenderId(), chatMessages.getReceiverId());
            return "Message queued for " + chatMessages.getReceiverId();
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize ChatMessages object: {}", e.getMessage(), e);
            throw new RuntimeException("Serialization error occurred", e);
        }
    }

    public String sendForumMessage(String messagePayload) {
        rabbitTemplate.convertAndSend("forum-chat-queue", messagePayload);
        log.info("Successfully published forum message to RabbitMQ queue");
        return "Forum message queued";
    }
}