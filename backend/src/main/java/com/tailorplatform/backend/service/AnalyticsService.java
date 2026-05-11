package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.AdminAnalyticsResponse;
import com.tailorplatform.backend.dto.TailorAnalyticsResponse;
import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository         orderRepository;
    private final TailorProfileRepository tailorProfileRepository;
    private final ReviewRepository        reviewRepository;
    private final UserRepository          userRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    // ─── Tailor Analytics ────────────────────────────────────────────────────

    public TailorAnalyticsResponse getTailorAnalytics(Long tailorId) {
        List<Order> orders = orderRepository.findByTailorId(tailorId);
        var reviews        = reviewRepository.findByTailorIdOrderByCreatedAtDesc(tailorId);

        int total       = orders.size();
        int completed   = (int) orders.stream().filter(o -> "DELIVERED".equals(o.getOrderStatus())).count();
        int active      = (int) orders.stream().filter(o -> isActive(o.getOrderStatus())).count();
        int cancelled   = total - completed - active;

        BigDecimal earnings = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()) && o.getAmount() != null)
                .map(o -> BigDecimal.valueOf(o.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double avgRating = reviews.isEmpty() ? 0.0 :
                reviews.stream().mapToInt(r -> r.getRating()).average().orElse(0.0);

        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        Map<String, Integer>    ordersByMonth   = buildOrdersByMonth(orders, sixMonthsAgo);
        Map<String, BigDecimal> earningsByMonth = buildEarningsByMonth(orders, sixMonthsAgo);
        Map<String, Integer>    byStatus        = buildOrdersByStatus(orders);
        List<Map.Entry<String, Integer>> topStyles = buildTopStyles(orders);

        return TailorAnalyticsResponse.builder()
                .tailorId(tailorId)
                .totalOrders(total)
                .completedOrders(completed)
                .activeOrders(active)
                .cancelledOrders(Math.max(cancelled, 0))
                .totalEarnings(earnings)
                .averageRating(round2(avgRating))
                .totalReviews(reviews.size())
                .ordersByMonth(ordersByMonth)
                .earningsByMonth(earningsByMonth)
                .ordersByStatus(byStatus)
                .topStyles(topStyles)
                .build();
    }

    // ─── Admin Analytics ─────────────────────────────────────────────────────

    public AdminAnalyticsResponse getAdminAnalytics() {
        List<Order>         allOrders  = orderRepository.findAll();
        List<TailorProfile> tailors    = tailorProfileRepository.findAll();
        var allReviews  = reviewRepository.findAll();

        int totalUsers    = (int) userRepository.count();
        int totalTailors  = tailors.size();
        int verified      = (int) tailors.stream()
                .filter(t -> "APPROVED".equals(t.getVerificationStatus())).count();

        int total       = allOrders.size();
        int completed   = (int) allOrders.stream().filter(o -> "DELIVERED".equals(o.getOrderStatus())).count();
        int active      = (int) allOrders.stream().filter(o -> isActive(o.getOrderStatus())).count();

        BigDecimal revenue = allOrders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()) && o.getAmount() != null)
                .map(o -> BigDecimal.valueOf(o.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double avgRating = allReviews.isEmpty() ? 0.0 :
                allReviews.stream().mapToInt(r -> r.getRating()).average().orElse(0.0);

        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        Map<String, Integer>    ordersByMonth   = buildOrdersByMonth(allOrders, sixMonthsAgo);
        Map<String, BigDecimal> revenueByMonth  = buildEarningsByMonth(allOrders, sixMonthsAgo);
        Map<String, Integer>    byStatus        = buildOrdersByStatus(allOrders);
        Map<String, Integer>    usersByMonth    = buildUsersByMonth(sixMonthsAgo);

        List<Map<String, Object>> topTailors = buildTopTailors(allOrders, tailors);

        return AdminAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalTailors(totalTailors)
                .verifiedTailors(verified)
                .totalOrders(total)
                .completedOrders(completed)
                .activeOrders(active)
                .totalRevenue(revenue)
                .averagePlatformRating(round2(avgRating))
                .totalReviews(allReviews.size())
                .newUsersByMonth(usersByMonth)
                .ordersByMonth(ordersByMonth)
                .revenueByMonth(revenueByMonth)
                .ordersByStatus(byStatus)
                .topTailors(topTailors)
                .build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private boolean isActive(String status) {
        return "NEW".equals(status) || "ACCEPTED".equals(status)
                || "IN_PROGRESS".equals(status) || "READY".equals(status);
    }

    /** Orders per calendar month for the last 6 months (ordered, missing months = 0). */
    private Map<String, Integer> buildOrdersByMonth(List<Order> orders, LocalDateTime since) {
        Map<String, Integer> result = emptyMonthMap(since);
        orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(since))
                .forEach(o -> result.merge(o.getCreatedAt().format(MONTH_FMT), 1, Integer::sum));
        return result;
    }

    private Map<String, BigDecimal> buildEarningsByMonth(List<Order> orders, LocalDateTime since) {
        Map<String, BigDecimal> result = emptyMonthMapBD(since);
        orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus())
                        && o.getAmount() != null
                        && o.getCreatedAt() != null
                        && o.getCreatedAt().isAfter(since))
                .forEach(o -> result.merge(
                        o.getCreatedAt().format(MONTH_FMT),
                        BigDecimal.valueOf(o.getAmount()),
                        BigDecimal::add));
        return result;
    }

    private Map<String, Integer> buildOrdersByStatus(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(Order::getOrderStatus, Collectors.summingInt(x -> 1)));
    }

    private List<Map.Entry<String, Integer>> buildTopStyles(List<Order> orders) {
        Map<String, Integer> counts = new HashMap<>();
        orders.stream()
                .filter(o -> o.getStyleChoice() != null && !o.getStyleChoice().isBlank())
                .forEach(o -> counts.merge(o.getStyleChoice(), 1, Integer::sum));
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private Map<String, Integer> buildUsersByMonth(LocalDateTime since) {
        // Approximate: count users created in each month using createdAt
        Map<String, Integer> result = emptyMonthMap(since);
        userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(since))
                .forEach(u -> result.merge(u.getCreatedAt().format(MONTH_FMT), 1, Integer::sum));
        return result;
    }

    private List<Map<String, Object>> buildTopTailors(List<Order> allOrders, List<TailorProfile> tailors) {
        // Count completed orders per tailor
        Map<Long, Long> completedByTailor = allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getOrderStatus()))
                .collect(Collectors.groupingBy(Order::getTailorId, Collectors.counting()));

        return tailors.stream()
                .sorted(Comparator.comparingLong(
                        (TailorProfile t) -> completedByTailor.getOrDefault(t.getId(), 0L)).reversed())
                .limit(5)
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("tailorId",        t.getId());
                    m.put("shopName",        t.getShopName());
                    m.put("completedOrders", completedByTailor.getOrDefault(t.getId(), 0L));
                    m.put("rating",          t.getRating());
                    return m;
                })
                .collect(Collectors.toList());
    }

    /** Builds a sorted LinkedHashMap with 0 for every month in the last 6 months. */
    private Map<String, Integer> emptyMonthMap(LocalDateTime since) {
        Map<String, Integer> map = new LinkedHashMap<>();
        LocalDateTime cursor = since.plusMonths(1).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime now = LocalDateTime.now();
        while (!cursor.isAfter(now)) {
            map.put(cursor.format(MONTH_FMT), 0);
            cursor = cursor.plusMonths(1);
        }
        return map;
    }

    private Map<String, BigDecimal> emptyMonthMapBD(LocalDateTime since) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        LocalDateTime cursor = since.plusMonths(1).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime now = LocalDateTime.now();
        while (!cursor.isAfter(now)) {
            map.put(cursor.format(MONTH_FMT), BigDecimal.ZERO);
            cursor = cursor.plusMonths(1);
        }
        return map;
    }

    private double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
