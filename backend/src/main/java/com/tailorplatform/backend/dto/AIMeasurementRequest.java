package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AIMeasurementRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    /** Height in centimetres */
    @NotNull(message = "heightCm is required")
    @Min(value = 100, message = "Height must be at least 100 cm")
    @Max(value = 250, message = "Height must not exceed 250 cm")
    private Integer heightCm;

    /** Weight in kilograms */
    @NotNull(message = "weightKg is required")
    @Min(value = 30, message = "Weight must be at least 30 kg")
    @Max(value = 300, message = "Weight must not exceed 300 kg")
    private Integer weightKg;

    /**
     * Body shape hint: SLIM, REGULAR, ATHLETIC, PLUS
     * Used by the AI abstraction to tune suggestions.
     */
    @NotBlank(message = "bodyShape is required")
    private String bodyShape;

    /** Optional: base64-encoded reference image for richer analysis */
    private String bodyReferenceImageBase64;
}
