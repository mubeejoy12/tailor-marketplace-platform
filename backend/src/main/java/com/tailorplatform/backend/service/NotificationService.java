package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.NotificationResponse;
import com.tailorplatform.backend.entity.Notification;
import com.tailorplatform.backend.repository.NotificationRepository;
import com.tailorplatform.backend.security.AccessGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AccessGuard            accessGuard;

    // ─── Internal helper — called by other services ───────────────────────────

    public void send(Long userId, String message) {
        if (userId == null || message == null || message.isBlank()) return;
        Notification n = Notification.builder()
                .userId(userId)
                .message(message)
                .build();
        notificationRepository.save(n);
        log.debug("Notification sent → userId={} msg='{}'", userId, message);
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    public List<NotificationResponse> getByUser(Long userId) {
        accessGuard.requireSelf(userId);
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        accessGuard.requireSelf(userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        accessGuard.requireSelf(n.getUserId());
        n.setIsRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    public void markAllRead(Long userId) {
        accessGuard.requireSelf(userId);
        notificationRepository.markAllReadByUserId(userId);
    }
}
