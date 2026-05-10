package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MeasurementRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @Positive(message = "Chest must be positive")
    private BigDecimal chest;

    @Positive(message = "Waist must be positive")
    private BigDecimal waist;

    @Positive(message = "Sleeve must be positive")
    private BigDecimal sleeve;

    @Positive(message = "Neck must be positive")
    private BigDecimal neck;

    @Positive(message = "Shoulder must be positive")
    private BigDecimal shoulder;

    @Positive(message = "Hip must be positive")
    private BigDecimal hip;

    @Positive(message = "Trouser length must be positive")
    private BigDecimal trouserLength;

    @Positive(message = "Inseam must be positive")
    private BigDecimal inseam;

    private String bodyReferenceImage;
}
