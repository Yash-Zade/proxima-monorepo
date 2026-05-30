package com.teamarc.proxima.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamarc.proxima.entity.ChatMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final com.teamarc.proxima.repository.ChatMessagesRepo chatMessagesRepo;

    public java.util.List<ChatMessages> getChatHistory(Long senderId, Long receiverId) {
        return chatMessagesRepo.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                senderId, receiverId, senderId, receiverId
        );
    }

    public String sendPrivateMessage(ChatMessages chatMessages) {
        try {
            String payload = objectMapper.writeValueAsString(chatMessages);
            kafkaTemplate.send("direct-chat-topic", String.valueOf(chatMessages.getSenderId()), payload);
            log.info("Successfully published direct message to Kafka topic for sender: {} and receiver: {}",
                    chatMessages.getSenderId(), chatMessages.getReceiverId());
            return "Message queued for " + chatMessages.getReceiverId();
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize ChatMessages object: {}", e.getMessage(), e);
            throw new RuntimeException("Serialization error occurred", e);
        }
    }

    public String sendForumMessage(String messagePayload) {
        kafkaTemplate.send("forum-chat-topic", messagePayload);
        log.info("Successfully published forum message to Kafka topic");
        return "Forum message queued";
    }
}