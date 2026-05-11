package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.ReviewRequest;
import com.tailorplatform.backend.dto.ReviewResponse;
import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.entity.Review;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.OrderRepository;
import com.tailorplatform.backend.repository.ReviewRepository;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository        reviewRepository;
    private final OrderRepository         orderRepository;
    private final TailorProfileRepository tailorProfileRepository;
    private final UserRepository          userRepository;

    // ─── Submit review ────────────────────────────────────────────────────────

    @Transactional
    public ReviewResponse submitReview(ReviewRequest req) {
        // 1. Verify the order exists and belongs to this user
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        if (!order.getUserId().equals(req.getUserId())) {
            throw new IllegalArgumentException("This order does not belong to you.");
        }

        // 2. Only DELIVERED orders can be reviewed
        if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException("You can only review orders that have been delivered.");
        }

        // 3. One review per order
        if (reviewRepository.existsByOrderId(req.getOrderId())) {
            throw new IllegalStateException("You have already reviewed this order.");
        }

        // 4. Save review
        Review review = Review.builder()
                .userId(req.getUserId())
                .tailorId(req.getTailorId())
                .orderId(req.getOrderId())
                .rating(req.getRating())
                .comment(req.getComment())
                .build();
        Review saved = reviewRepository.save(review);
        log.info("Review submitted — orderId={} rating={}", req.getOrderId(), req.getRating());

        // 5. Recalculate and persist the tailor's average rating
        recalculateTailorRating(req.getTailorId());

        String reviewerName = userRepository.findById(req.getUserId())
                .map(User::getFullName)
                .orElse("Customer");

        return ReviewResponse.from(saved, reviewerName);
    }

    // ─── Get reviews for a tailor ─────────────────────────────────────────────

    public List<ReviewResponse> getReviewsByTailor(Long tailorId) {
        return reviewRepository.findByTailorIdOrderByCreatedAtDesc(tailorId).stream()
                .map(r -> {
                    String name = userRepository.findById(r.getUserId())
                            .map(User::getFullName)
                            .orElse("Customer");
                    return ReviewResponse.from(r, name);
                })
                .collect(Collectors.toList());
    }

    // ─── Check if user already reviewed an order ──────────────────────────────

    public boolean hasReviewed(Long orderId) {
        return reviewRepository.existsByOrderId(orderId);
    }

    // ─── Recalculate tailor average rating ────────────────────────────────────

    private void recalculateTailorRating(Long tailorId) {
        List<Review> reviews = reviewRepository.findByTailorIdOrderByCreatedAtDesc(tailorId);
        if (reviews.isEmpty()) return;

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        tailorProfileRepository.findById(tailorId).ifPresent(t -> {
            t.setRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
            tailorProfileRepository.save(t);
            log.info("Tailor {} rating updated → {}", tailorId, t.getRating());
        });
    }
}
