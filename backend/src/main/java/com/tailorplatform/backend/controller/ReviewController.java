package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.ReviewRequest;
import com.tailorplatform.backend.dto.ReviewResponse;
import com.tailorplatform.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** POST /api/reviews — submit a review for a delivered order */
    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.submitReview(req));
    }

    /** GET /api/reviews/tailor/{tailorId} — all reviews for a tailor */
    @GetMapping("/tailor/{tailorId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByTailor(@PathVariable Long tailorId) {
        return ResponseEntity.ok(reviewService.getReviewsByTailor(tailorId));
    }

    /** GET /api/reviews/order/{orderId}/exists — check if order already reviewed */
    @GetMapping("/order/{orderId}/exists")
    public ResponseEntity<Map<String, Boolean>> hasReview(@PathVariable Long orderId) {
        return ResponseEntity.ok(Map.of("reviewed", reviewService.hasReviewed(orderId)));
    }
}
