package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "tailorId is required")
    private Long tailorId;

    @NotNull(message = "orderId is required")
    private Long orderId;

    @NotNull(message = "rating is required")
    @Min(value = 1, message = "rating must be at least 1")
    @Max(value = 5, message = "rating must not exceed 5")
    private Integer rating;

    private String comment;
}
