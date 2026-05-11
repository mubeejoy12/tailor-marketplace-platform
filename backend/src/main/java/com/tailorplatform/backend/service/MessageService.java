package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.ConversationRequest;
import com.tailorplatform.backend.dto.ConversationResponse;
import com.tailorplatform.backend.dto.MessageRequest;
import com.tailorplatform.backend.dto.MessageResponse;
import com.tailorplatform.backend.entity.Conversation;
import com.tailorplatform.backend.entity.Message;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.ConversationRepository;
import com.tailorplatform.backend.repository.MessageRepository;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository  conversationRepository;
    private final MessageRepository       messageRepository;
    private final UserRepository          userRepository;
    private final TailorProfileRepository tailorProfileRepository;

    // ─── Get or create a conversation thread ─────────────────────────────────

    @Transactional
    public ConversationResponse getOrCreateConversation(ConversationRequest req) {
        Conversation conv = conversationRepository
                .findByCustomerIdAndTailorId(req.getCustomerId(), req.getTailorId())
                .orElseGet(() -> {
                    Conversation c = Conversation.builder()
                            .customerId(req.getCustomerId())
                            .tailorId(req.getTailorId())
                            .build();
                    return conversationRepository.save(c);
                });
        return toConversationResponse(conv, req.getCustomerId());
    }

    // ─── List conversations for a user ───────────────────────────────────────

    public List<ConversationResponse> getConversationsForUser(Long userId) {
        return conversationRepository
                .findByCustomerIdOrTailorIdOrderByLastMessageAtDesc(userId, userId)
                .stream()
                .map(c -> toConversationResponse(c, userId))
                .collect(Collectors.toList());
    }

    // ─── Get messages in a conversation ──────────────────────────────────────

    @Transactional
    public List<MessageResponse> getMessages(Long conversationId, Long readerId) {
        messageRepository.markMessagesRead(conversationId, readerId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(m -> {
                    String name = userRepository.findById(m.getSenderId())
                            .map(User::getFullName)
                            .orElse("User");
                    return MessageResponse.from(m, name);
                })
                .collect(Collectors.toList());
    }

    // ─── Send a message ───────────────────────────────────────────────────────

    @Transactional
    public MessageResponse sendMessage(MessageRequest req) {
        Conversation conv = conversationRepository.findById(req.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Conversation not found: " + req.getConversationId()));

        Message msg = Message.builder()
                .conversationId(req.getConversationId())
                .senderId(req.getSenderId())
                .content(req.getContent())
                .build();
        Message saved = messageRepository.save(msg);
        log.debug("Message sent → convId={} sender={}", req.getConversationId(), req.getSenderId());

        // Update conversation preview
        conv.setLastMessage(req.getContent().length() > 80
                ? req.getContent().substring(0, 80) + "…"
                : req.getContent());
        conv.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conv);

        String senderName = userRepository.findById(req.getSenderId())
                .map(User::getFullName)
                .orElse("User");

        return MessageResponse.from(saved, senderName);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private ConversationResponse toConversationResponse(Conversation c, Long viewerId) {
        String customerName = userRepository.findById(c.getCustomerId())
                .map(User::getFullName)
                .orElse("Customer");

        String tailorName = tailorProfileRepository.findById(c.getTailorId())
                .map(TailorProfile::getShopName)
                .orElseGet(() -> userRepository.findById(c.getTailorId())
                        .map(User::getFullName)
                        .orElse("Tailor"));

        long unread = messageRepository
                .countByConversationIdAndIsReadFalseAndSenderIdNot(c.getId(), viewerId);

        return ConversationResponse.from(c, customerName, tailorName, unread);
    }
}
