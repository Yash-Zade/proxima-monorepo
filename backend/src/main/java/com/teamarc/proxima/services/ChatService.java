package com.teamarc.proxima.services;

import com.teamarc.proxima.entity.ChatMessages;
import com.teamarc.proxima.entity.ChatRoom;
import com.teamarc.proxima.repository.ChatMessagesRepo;
import com.teamarc.proxima.repository.ChatRoomRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ChatRoomRepo chatRoomRepo;
    private final ChatMessagesRepo chatMessagesRepo;

    public String sendPrivateMessage(ChatMessages chatMessages) {
        Optional<ChatRoom> chatRoom = chatRoomRepo.findBySenderIdAndReceiverId(chatMessages.getSenderId(), chatMessages.getReceiverId());

        if (chatRoom.isEmpty()) {
            ChatRoom senderRecepient = ChatRoom.builder()
                    .senderId(chatMessages.getSenderId())
                    .receiverId(chatMessages.getReceiverId())
                    .build();
            ChatRoom recipientSender = ChatRoom.builder()
                    .senderId(chatMessages.getReceiverId())
                    .receiverId(chatMessages.getSenderId())
                    .build();
            chatRoomRepo.save(senderRecepient);
            chatRoomRepo.save(recipientSender);
        }

        ChatMessages savedMessages = chatMessagesRepo.save(chatMessages);
        simpMessagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessages.getReceiverId()),
                "/queue/messages",
                savedMessages
        );

        return "Message sent to " + chatMessages.getReceiverId();
    }
}