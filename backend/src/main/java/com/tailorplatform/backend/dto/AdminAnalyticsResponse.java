package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Platform-wide analytics for the admin dashboard.
 */
@Data
@Builder
public class AdminAnalyticsResponse {

    // ─── Platform totals ─────────────────────────────────────────────────────
    private int        totalUsers;
    private int        totalTailors;
    private int        verifiedTailors;
    private int        totalOrders;
    private int        completedOrders;
    private int        activeOrders;
    private BigDecimal totalRevenue;
    private double     averagePlatformRating;
    private int        totalReviews;

    // ─── Time-series (last 6 months, key = "YYYY-MM") ────────────────────────
    private Map<String, Integer>    newUsersByMonth;
    private Map<String, Integer>    ordersByMonth;
    private Map<String, BigDecimal> revenueByMonth;

    // ─── Breakdowns ──────────────────────────────────────────────────────────
    private Map<String, Integer> ordersByStatus;

    /** Top 5 tailors by completed orders */
    private List<Map<String, Object>> topTailors;
}
