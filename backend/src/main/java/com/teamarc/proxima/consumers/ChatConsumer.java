package com.teamarc.proxima.consumers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamarc.proxima.entity.ChatMessages;
import com.teamarc.proxima.entity.ChatRoom;
import com.teamarc.proxima.entity.ForumMessage;
import com.teamarc.proxima.repository.ChatMessagesRepo;
import com.teamarc.proxima.repository.ChatRoomRepo;
import com.teamarc.proxima.repository.ForumMessageRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatConsumer {

    private final ChatMessagesRepo chatMessagesRepo;
    private final ChatRoomRepo chatRoomRepo;
    private final ForumMessageRepo forumMessageRepo;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "direct-chat-topic", groupId = "proxima-chat-group")
    public void consumeDirectMessage(String payload) {
        log.info("Received private message from Kafka: {}", payload);
        try {
            ChatMessages chatMessages = objectMapper.readValue(payload, ChatMessages.class);

            // Verify/create ChatRoom relationship
            Optional<ChatRoom> chatRoom = chatRoomRepo.findBySenderIdAndReceiverId(chatMessages.getSenderId(), chatMessages.getReceiverId());
            if (chatRoom.isEmpty()) {
                ChatRoom senderRecipient = ChatRoom.builder()
                        .senderId(chatMessages.getSenderId())
                        .receiverId(chatMessages.getReceiverId())
                        .build();
                ChatRoom recipientSender = ChatRoom.builder()
                        .senderId(chatMessages.getReceiverId())
                        .receiverId(chatMessages.getSenderId())
                        .build();
                chatRoomRepo.save(senderRecipient);
                chatRoomRepo.save(recipientSender);
                log.info("Created new ChatRoom relationship for sender: {} and receiver: {}",
                        chatMessages.getSenderId(), chatMessages.getReceiverId());
            }

            // Persist message record to database
            ChatMessages savedMessages = chatMessagesRepo.save(chatMessages);
            log.info("Persisted direct message record in DB with ID: {}", savedMessages.getId());

            // Push point-to-point via WebSocket to User B's dedicated absolute topic
            simpMessagingTemplate.convertAndSend(
                    "/topic/private-messages/" + chatMessages.getReceiverId(),
                    savedMessages
            );
            log.info("Delivered private message via WebSocket to User: {}", chatMessages.getReceiverId());

        } catch (Exception e) {
            log.error("Error processing consumed direct message payload: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "forum-chat-topic", groupId = "proxima-chat-group")
    public void consumeForumMessage(String payload) {
        log.info("Received forum message from Kafka: {}", payload);
        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            if (rootNode.has("type") && "FORUM_MSG".equals(rootNode.get("type").asText())) {
                JsonNode msgNode = rootNode.get("message");

                // Construct and save ForumMessage to database
                ForumMessage forumMsg = ForumMessage.builder()
                        .forumId(rootNode.get("forumId").asLong())
                        .content(msgNode.get("content").asText())
                        .author(msgNode.get("author").asText())
                        .timestamp(msgNode.get("timestamp").asText())
                        .build();
                forumMessageRepo.save(forumMsg);
                log.info("Persisted anonymous forum message record in DB under forumId: {}", forumMsg.getForumId());
            }

            // Push public message via WebSocket broadcast to all topic subscribers
            simpMessagingTemplate.convertAndSend("/topic/messages", payload);
            log.info("Delivered forum message broadcast to topic subscribers");

        } catch (Exception e) {
            log.error("Error processing consumed forum message payload: {}", e.getMessage(), e);
        }
    }
}
