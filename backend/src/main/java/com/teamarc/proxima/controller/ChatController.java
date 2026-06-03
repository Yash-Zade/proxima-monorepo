package com.teamarc.proxima.controller;

import com.teamarc.proxima.entity.ChatMessages;
import com.teamarc.proxima.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "https://proxima-main.vercel.app")
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/sendMessage")
    public void sendMessage(String message, SimpMessageHeaderAccessor headerAccessor) {
        chatService.sendForumMessage(message);
    }

    @MessageMapping("/sendPrivateMessage")
    public void sendPrivateMessage(ChatMessages chatMessages, SimpMessageHeaderAccessor headerAccessor) {
        chatService.sendPrivateMessage(chatMessages);
    }

    @PostMapping("/api/chat/sendMessage")
    public ResponseEntity<String> sendForumMessageRest(@RequestBody String message) {
        String res = chatService.sendForumMessage(message);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/api/chat/sendPrivateMessage")
    public ResponseEntity<String> sendPrivateMessageRest(@RequestBody ChatMessages chatMessages) {
        String res = chatService.sendPrivateMessage(chatMessages);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/api/chat/history/{senderId}/{receiverId}")
    public ResponseEntity<java.util.List<ChatMessages>> getChatHistory(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {
        return ResponseEntity.ok(chatService.getChatHistory(senderId, receiverId));
    }

    @GetMapping("/api/forum/history/{forumId}")
    public ResponseEntity<java.util.List<com.teamarc.proxima.entity.ForumMessage>> getForumHistory(
            @PathVariable Long forumId) {
        return ResponseEntity.ok(chatService.getForumHistory(forumId));
    }
}