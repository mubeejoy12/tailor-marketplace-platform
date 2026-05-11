package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Review;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {

    private Long id;
    private Long userId;
    private String reviewerName;  // populated by service from User lookup
    private Long tailorId;
    private Long orderId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r, String reviewerName) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .reviewerName(reviewerName)
                .tailorId(r.getTailorId())
                .orderId(r.getOrderId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
