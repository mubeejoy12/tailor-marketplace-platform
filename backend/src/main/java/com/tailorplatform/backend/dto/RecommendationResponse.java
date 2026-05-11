package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * A single tailor recommendation with a composite score and the weights that
 * contributed to it.  Consumers should display the score as a relative ranking
 * rather than an absolute percentage.
 */
@Data
@Builder
public class RecommendationResponse {

    private Long tailorId;
    private String shopName;
    private String location;
    private String specialization;
    private String profileImage;
    private BigDecimal rating;
    private int totalOrders;       // lifetime completed orders
    private boolean verified;

    /**
     * Composite score 0–100.
     * Weights: rating 40 %, specialization match 30 %, location match 20 %,
     * order history (repeat customer) 10 %.
     */
    private double score;

    /** Human-readable explanation why this tailor was recommended */
    private String matchReason;
}
