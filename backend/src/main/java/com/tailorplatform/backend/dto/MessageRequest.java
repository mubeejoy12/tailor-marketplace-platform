package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull(message = "senderId is required")
    private Long senderId;

    @NotNull(message = "conversationId is required")
    private Long conversationId;

    @NotBlank(message = "content must not be blank")
    private String content;
}
