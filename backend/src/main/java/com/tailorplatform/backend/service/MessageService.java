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
import com.tailorplatform.backend.security.AccessGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
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
    private final AccessGuard             accessGuard;

    // ─── Get or create a conversation thread ─────────────────────────────────

    @Transactional
    public ConversationResponse getOrCreateConversation(ConversationRequest req) {
        // conversation.tailorId is the tailor's PROFILE id; customerId is a user id
        if (!tailorProfileRepository.existsById(req.getTailorId())) {
            throw new IllegalArgumentException("Tailor not found: " + req.getTailorId());
        }
        var caller = accessGuard.currentUser();
        if (!caller.isAdmin() && !caller.userId().equals(req.getCustomerId())
                && !accessGuard.ownsTailorProfile(req.getTailorId())) {
            throw new AccessDeniedException("You can only start conversations you take part in.");
        }

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
        accessGuard.requireSelf(userId);

        // As a customer the user appears by user id; as a tailor, by their profile id
        List<Conversation> conversations = tailorProfileRepository.findByUserId(userId)
                .map(profile -> conversationRepository
                        .findByCustomerIdOrTailorIdOrderByLastMessageAtDesc(userId, profile.getId()))
                .orElseGet(() -> conversationRepository.findByCustomerIdOrderByLastMessageAtDesc(userId));

        return conversations.stream()
                .sorted(Comparator.comparing(Conversation::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> toConversationResponse(c, userId))
                .collect(Collectors.toList());
    }

    // ─── Get messages in a conversation ──────────────────────────────────────

    @Transactional
    public List<MessageResponse> getMessages(Long conversationId, Long readerId) {
        accessGuard.requireSelf(readerId);
        requireParticipant(conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId)));

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
        accessGuard.requireSelf(req.getSenderId());
        requireParticipant(conv);

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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Caller is the conversation's customer, owns its tailor profile, or is an admin. */
    private void requireParticipant(Conversation conv) {
        var caller = accessGuard.currentUser();
        if (caller.isAdmin() || caller.userId().equals(conv.getCustomerId())) return;
        if (!accessGuard.ownsTailorProfile(conv.getTailorId())) {
            throw new AccessDeniedException("You are not part of this conversation.");
        }
    }

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
