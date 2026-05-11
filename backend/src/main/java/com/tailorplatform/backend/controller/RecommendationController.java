package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.RecommendationResponse;
import com.tailorplatform.backend.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * GET /api/recommendations
     *
     * Query params (all optional):
     *   userId          — requesting user ID (enables repeat-customer bonus)
     *   specialization  — keyword to match tailor specialization
     *   location        — keyword to match tailor location
     *   limit           — max results (default 6)
     */
    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> recommend(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "6") int limit) {

        return ResponseEntity.ok(
                recommendationService.recommend(userId, specialization, location, limit));
    }
}
