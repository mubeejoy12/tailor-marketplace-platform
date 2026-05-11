package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminMetricsResponse {

    private long totalUsers;
    private long totalTailors;
    private long totalOrders;
    private long activeOrders;      // NEW | ACCEPTED | IN_PROGRESS | READY
    private long completedOrders;   // DELIVERED
    private double totalRevenue;    // sum of paid order amounts
    private long totalReviews;
    private long pendingVerifications;
    private long unreadMessages;
}
