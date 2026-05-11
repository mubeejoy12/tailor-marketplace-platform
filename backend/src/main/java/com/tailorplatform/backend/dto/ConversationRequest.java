package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConversationRequest {

    @NotNull(message = "customerId is required")
    private Long customerId;

    @NotNull(message = "tailorId is required")
    private Long tailorId;
}
