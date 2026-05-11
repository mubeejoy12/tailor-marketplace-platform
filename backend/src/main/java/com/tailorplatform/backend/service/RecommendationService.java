package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.RecommendationResponse;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.repository.OrderRepository;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Scores every approved tailor and returns the top-N recommendations for a
 * given user/context.
 *
 * <h3>Scoring formula (total = 100 pts)</h3>
 * <ul>
 *   <li>Rating score  — 40 pts  (tailor rating / 5 × 40)</li>
 *   <li>Specialization match — 30 pts (exact keyword match in specialization field)</li>
 *   <li>Location match — 20 pts (city/word match in location field)</li>
 *   <li>Repeat-customer bonus — 10 pts (user has ordered from this tailor before)</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final int DEFAULT_LIMIT = 6;

    private final TailorProfileRepository tailorProfileRepository;
    private final OrderRepository         orderRepository;

    /**
     * Returns up to {@code limit} tailors ranked by composite score.
     *
     * @param userId          the requesting user (used for repeat-customer bonus)
     * @param specialization  optional keyword to match against tailor specialization
     * @param location        optional keyword to match against tailor city/region
     * @param limit           max results (defaults to {@value DEFAULT_LIMIT})
     */
    public List<RecommendationResponse> recommend(
            Long userId,
            String specialization,
            String location,
            int limit) {

        // Only recommend verified tailors
        List<TailorProfile> tailors = tailorProfileRepository.findByVerificationStatus("APPROVED");
        if (tailors.isEmpty()) {
            // Fall back to all tailors when no approved ones exist (e.g. dev/test)
            tailors = tailorProfileRepository.findAll();
        }

        // Set of tailorIds that this user has previously ordered from
        java.util.Set<Long> previousTailorIds = new java.util.HashSet<>();
        if (userId != null) {
            orderRepository.findByUserId(userId)
                    .forEach(o -> previousTailorIds.add(o.getTailorId()));
        }

        List<RecommendationResponse> scored = new ArrayList<>();
        for (TailorProfile t : tailors) {
            scored.add(score(t, userId, specialization, location, previousTailorIds));
        }

        scored.sort(Comparator.comparingDouble(RecommendationResponse::getScore).reversed());

        return scored.subList(0, Math.min(limit > 0 ? limit : DEFAULT_LIMIT, scored.size()));
    }

    // ─── Scoring ─────────────────────────────────────────────────────────────

    private RecommendationResponse score(
            TailorProfile tailor,
            Long userId,
            String specialization,
            String location,
            java.util.Set<Long> previousTailorIds) {

        double ratingScore  = scoreRating(tailor);
        double specScore    = scoreSpecialization(tailor, specialization);
        double locScore     = scoreLocation(tailor, location);
        double historyScore = previousTailorIds.contains(tailor.getId()) ? 10.0 : 0.0;

        double total = ratingScore + specScore + locScore + historyScore;

        int completedOrders = (int) orderRepository.findByTailorId(tailor.getId())
                .stream()
                .filter(o -> "DELIVERED".equals(o.getOrderStatus()))
                .count();

        String reason = buildReason(ratingScore, specScore, locScore, historyScore, specialization, location);

        return RecommendationResponse.builder()
                .tailorId(tailor.getId())
                .shopName(tailor.getShopName())
                .location(tailor.getLocation())
                .specialization(tailor.getSpecialization())
                .profileImage(tailor.getProfileImage())
                .rating(tailor.getRating())
                .totalOrders(completedOrders)
                .verified("APPROVED".equals(tailor.getVerificationStatus()))
                .score(Math.min(total, 100.0))
                .matchReason(reason)
                .build();
    }

    /** Rating contributes up to 40 points (linear 0–5 → 0–40). */
    private double scoreRating(TailorProfile t) {
        if (t.getRating() == null) return 0;
        return t.getRating().doubleValue() / 5.0 * 40.0;
    }

    /** Specialization match contributes 30 points. */
    private double scoreSpecialization(TailorProfile t, String spec) {
        if (spec == null || spec.isBlank() || t.getSpecialization() == null) return 0;
        return t.getSpecialization().toLowerCase().contains(spec.toLowerCase()) ? 30.0 : 0.0;
    }

    /** Location match contributes 20 points. */
    private double scoreLocation(TailorProfile t, String loc) {
        if (loc == null || loc.isBlank() || t.getLocation() == null) return 0;
        return t.getLocation().toLowerCase().contains(loc.toLowerCase()) ? 20.0 : 0.0;
    }

    private String buildReason(
            double ratingScore, double specScore, double locScore, double historyScore,
            String spec, String loc) {

        List<String> reasons = new ArrayList<>();
        if (ratingScore >= 32) reasons.add("highly rated");
        else if (ratingScore >= 16) reasons.add("well rated");
        if (specScore > 0)    reasons.add("specializes in " + spec);
        if (locScore > 0)     reasons.add("located in " + loc);
        if (historyScore > 0) reasons.add("you've ordered from them before");

        if (reasons.isEmpty()) return "Available tailor in our network";
        return String.join(", ", reasons).substring(0, 1).toUpperCase()
                + String.join(", ", reasons).substring(1);
    }
}
