package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Measurement;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MeasurementResponse {

    private Long id;
    private Long userId;
    private BigDecimal chest;
    private BigDecimal waist;
    private BigDecimal sleeve;
    private BigDecimal neck;
    private BigDecimal shoulder;
    private BigDecimal hip;
    private BigDecimal trouserLength;
    private BigDecimal inseam;
    private String bodyReferenceImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MeasurementResponse from(Measurement m) {
        return MeasurementResponse.builder()
                .id(m.getId())
                .userId(m.getUser() != null ? m.getUser().getId() : null)
                .chest(m.getChest())
                .waist(m.getWaist())
                .sleeve(m.getSleeve())
                .neck(m.getNeck())
                .shoulder(m.getShoulder())
                .hip(m.getHip())
                .trouserLength(m.getTrouserLength())
                .inseam(m.getInseam())
                .bodyReferenceImage(m.getBodyReferenceImage())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
