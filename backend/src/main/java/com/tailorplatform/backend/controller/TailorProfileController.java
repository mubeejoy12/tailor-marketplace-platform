package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.PagedResponse;
import com.tailorplatform.backend.dto.TailorProfileRequest;
import com.tailorplatform.backend.dto.TailorProfileResponse;
import com.tailorplatform.backend.dto.TailorVerificationRequest;
import com.tailorplatform.backend.service.TailorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tailors")
@RequiredArgsConstructor
public class TailorProfileController {

    private final TailorProfileService tailorProfileService;

    @PostMapping
    public TailorProfileResponse createProfile(@RequestBody TailorProfileRequest request) {
        return tailorProfileService.createProfile(request);
    }

    @GetMapping
    public List<TailorProfileResponse> getAllProfiles() {
        return tailorProfileService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public TailorProfileResponse getProfile(@PathVariable Long id) {
        return tailorProfileService.getProfile(id);
    }

    /** GET /api/tailors/user/{userId} — fetch a tailor's profile by their user account ID */
    @GetMapping("/user/{userId}")
    public TailorProfileResponse getProfileByUser(@PathVariable Long userId) {
        return tailorProfileService.getProfileByUserId(userId);
    }

    @GetMapping("/search/location")
    public List<TailorProfileResponse> searchByLocation(@RequestParam String location) {
        return tailorProfileService.searchByLocation(location);
    }

    @GetMapping("/search/specialization")
    public List<TailorProfileResponse> searchBySpecialization(@RequestParam String specialization) {
        return tailorProfileService.searchBySpecialization(specialization);
    }

    @PutMapping("/{id}")
    public TailorProfileResponse updateProfile(
            @PathVariable Long id,
            @RequestBody TailorProfileRequest request) {
        return tailorProfileService.updateProfile(id, request);
    }

    // ─── Advanced search ──────────────────────────────────────────────────────

    /**
     * GET /api/tailors/search
     *
     * Paginated, multi-filter search.  All params are optional.
     *
     * @param keyword        free-text across shopName/specialization/location
     * @param location       city/region filter
     * @param specialization garment-type filter
     * @param minRating      minimum star rating (e.g. 3.0)
     * @param verifiedOnly   if true, only APPROVED tailors
     * @param page           0-based page (default 0)
     * @param size           page size (default 12, max 50)
     * @param sortBy         "rating" | "shopName" | "location" (default "rating")
     */
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<TailorProfileResponse>> searchTailors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "false") boolean verifiedOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "rating") String sortBy) {

        return ResponseEntity.ok(tailorProfileService.searchTailors(
                keyword, location, specialization, minRating, verifiedOnly, page, size, sortBy));
    }

    // ─── Verification submission (tailor action) ──────────────────────────────

    /** POST /api/tailors/{id}/verification — tailor submits docs for admin review */
    @PostMapping("/{id}/verification")
    public ResponseEntity<TailorProfileResponse> submitVerification(
            @PathVariable Long id,
            @RequestBody TailorVerificationRequest req) {
        return ResponseEntity.ok(tailorProfileService.submitVerification(id, req));
    }
}
