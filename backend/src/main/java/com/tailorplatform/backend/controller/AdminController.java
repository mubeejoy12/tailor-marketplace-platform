package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.AdminMetricsResponse;
import com.tailorplatform.backend.dto.TailorProfileResponse;
import com.tailorplatform.backend.dto.UserProfileResponse;
import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.*;
import com.tailorplatform.backend.service.TailorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository          userRepository;
    private final TailorProfileRepository tailorProfileRepository;
    private final OrderRepository         orderRepository;
    private final ReviewRepository        reviewRepository;
    private final TailorProfileService    tailorProfileService;

    // ─── Dashboard metrics ────────────────────────────────────────────────────

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> getMetrics() {
        long totalUsers    = userRepository.count();
        long totalTailors  = tailorProfileRepository.count();
        long totalOrders   = orderRepository.count();
        long totalReviews  = reviewRepository.count();
        long pendingVerif  = tailorProfileRepository.countByVerificationStatus("PENDING");

        List<Order> allOrders  = orderRepository.findAll();
        long activeOrders    = allOrders.stream()
                .filter(o -> !o.getOrderStatus().equals("DELIVERED"))
                .count();
        long completedOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus().equals("DELIVERED"))
                .count();
        double totalRevenue = allOrders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()) && o.getAmount() != null)
                .mapToDouble(Order::getAmount)
                .sum();

        return ResponseEntity.ok(AdminMetricsResponse.builder()
                .totalUsers(totalUsers)
                .totalTailors(totalTailors)
                .totalOrders(totalOrders)
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .totalRevenue(totalRevenue)
                .totalReviews(totalReviews)
                .pendingVerifications(pendingVerif)
                .build());
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        List<UserProfileResponse> users = userRepository.findAll()
                .stream()
                .map(UserProfileResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // ─── Orders ───────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        List<Map<String, Object>> orders = orderRepository.findAll()
                .stream()
                .map(o -> Map.<String, Object>of(
                        "id",            o.getId(),
                        "userId",        o.getUserId(),
                        "tailorId",      o.getTailorId(),
                        "styleChoice",   o.getStyleChoice() != null ? o.getStyleChoice() : "",
                        "orderStatus",   o.getOrderStatus(),
                        "paymentStatus", o.getPaymentStatus(),
                        "amount",        o.getAmount() != null ? o.getAmount() : 0.0,
                        "createdAt",     o.getCreatedAt() != null ? o.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    // ─── Tailor verifications ─────────────────────────────────────────────────

    @GetMapping("/verifications/pending")
    public ResponseEntity<List<TailorProfileResponse>> getPendingVerifications() {
        return ResponseEntity.ok(tailorProfileService.getPendingVerifications());
    }

    @PutMapping("/tailors/{tailorId}/verify")
    public ResponseEntity<TailorProfileResponse> reviewVerification(
            @PathVariable Long tailorId,
            @RequestBody Map<String, String> body) {
        String decision = body.getOrDefault("decision", "");
        String note     = body.getOrDefault("note", "");
        return ResponseEntity.ok(tailorProfileService.reviewVerification(tailorId, decision, note));
    }

    // ─── Tailors ──────────────────────────────────────────────────────────────

    @GetMapping("/tailors")
    public ResponseEntity<List<TailorProfileResponse>> getAllTailors() {
        return ResponseEntity.ok(tailorProfileService.getAllProfiles());
    }
}
