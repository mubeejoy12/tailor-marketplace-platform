package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.NotificationResponse;
import com.tailorplatform.backend.entity.Notification;
import com.tailorplatform.backend.repository.NotificationRepository;
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
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        n.setIsRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
