package com.teamarc.proxima.controller;

import com.teamarc.proxima.entity.ChatMessages;
import com.teamarc.proxima.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public String sendMessage(String message, SimpMessageHeaderAccessor headerAccessor) {
        return message;
    }

    @MessageMapping("/sendPrivateMessage")
    @SendTo("/user/{userId}/queue/messages")
    public String sendPrivateMessage(ChatMessages chatMessages, SimpMessageHeaderAccessor headerAccessor) {
        return chatService.sendPrivateMessage(chatMessages);
    }
}