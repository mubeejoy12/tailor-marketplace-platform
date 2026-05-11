package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.AdminAnalyticsResponse;
import com.tailorplatform.backend.dto.TailorAnalyticsResponse;
import com.tailorplatform.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/analytics/tailor/{tailorId}
     * Returns analytics for a specific tailor (their own dashboard).
     */
    @GetMapping("/tailor/{tailorId}")
    public ResponseEntity<TailorAnalyticsResponse> tailorAnalytics(@PathVariable Long tailorId) {
        return ResponseEntity.ok(analyticsService.getTailorAnalytics(tailorId));
    }

    /**
     * GET /api/analytics/admin
     * Returns platform-wide analytics (admin only).
     */
    @GetMapping("/admin")
    public ResponseEntity<AdminAnalyticsResponse> adminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }
}
