package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Analytics snapshot for a tailor's own dashboard.
 */
@Data
@Builder
public class TailorAnalyticsResponse {

    private Long tailorId;

    // ─── Lifetime totals ──────────────────────────────────────────────────────
    private int    totalOrders;
    private int    completedOrders;
    private int    activeOrders;
    private int    cancelledOrders;
    private BigDecimal totalEarnings;   // sum of paid order amounts
    private double averageRating;
    private int    totalReviews;

    // ─── Time-series (last 6 months, key = "YYYY-MM") ────────────────────────
    /** Orders placed per month */
    private Map<String, Integer> ordersByMonth;

    /** Earnings per month */
    private Map<String, BigDecimal> earningsByMonth;

    // ─── Order status breakdown for pie/donut chart ───────────────────────────
    private Map<String, Integer> ordersByStatus;

    // ─── Top garment types (from styleChoice) ────────────────────────────────
    private List<Map.Entry<String, Integer>> topStyles;
}
