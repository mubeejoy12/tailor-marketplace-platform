package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * AI-generated measurement suggestions.
 * All values are in centimetres (cm) and can be edited by the user before saving.
 */
@Data
@Builder
public class AIMeasurementResponse {

    private Long userId;

    // ─── Suggested measurements ───────────────────────────────────────────────
    private BigDecimal chest;
    private BigDecimal waist;
    private BigDecimal hip;
    private BigDecimal sleeve;
    private BigDecimal neck;
    private BigDecimal shoulder;
    private BigDecimal trouserLength;
    private BigDecimal inseam;

    /** 0.0 – 1.0 confidence score from the AI engine */
    private double confidenceScore;

    /** Human-readable explanation of the suggestion */
    private String reasoning;

    /** Body shape category used for derivation */
    private String bodyShape;

    /** true = suggestions came from a real AI model; false = rule-based estimation */
    private boolean aiPowered;
}
