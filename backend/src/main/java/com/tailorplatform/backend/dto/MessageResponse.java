package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Message;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {

    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;   // populated from User lookup
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static MessageResponse from(Message m, String senderName) {
        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .senderName(senderName)
                .content(m.getContent())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
