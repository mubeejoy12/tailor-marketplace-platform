package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Conversation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConversationResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long tailorId;
    private String tailorName;   // tailor's shop name
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private long unreadCount;

    public static ConversationResponse from(Conversation c, String customerName, String tailorName, long unreadCount) {
        return ConversationResponse.builder()
                .id(c.getId())
                .customerId(c.getCustomerId())
                .customerName(customerName)
                .tailorId(c.getTailorId())
                .tailorName(tailorName)
                .lastMessage(c.getLastMessage())
                .lastMessageAt(c.getLastMessageAt())
                .createdAt(c.getCreatedAt())
                .unreadCount(unreadCount)
                .build();
    }
}
