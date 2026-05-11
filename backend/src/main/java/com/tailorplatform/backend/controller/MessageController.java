package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.ConversationRequest;
import com.tailorplatform.backend.dto.ConversationResponse;
import com.tailorplatform.backend.dto.MessageRequest;
import com.tailorplatform.backend.dto.MessageResponse;
import com.tailorplatform.backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** POST /api/messages/conversations — get existing or create new conversation */
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> getOrCreateConversation(
            @Valid @RequestBody ConversationRequest req) {
        return ResponseEntity.ok(messageService.getOrCreateConversation(req));
    }

    /** GET /api/messages/conversations/{userId} — all conversations for a user */
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponse>> getConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversationsForUser(userId));
    }

    /** GET /api/messages/conversation/{conversationId}?readerId={userId} — get + mark read */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam Long readerId) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, readerId));
    }

    /** POST /api/messages — send a message */
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(req));
    }
}
