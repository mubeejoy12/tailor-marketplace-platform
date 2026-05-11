package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.PagedResponse;
import com.tailorplatform.backend.dto.TailorProfileRequest;
import com.tailorplatform.backend.dto.TailorProfileResponse;
import com.tailorplatform.backend.dto.TailorVerificationRequest;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import com.tailorplatform.backend.repository.UserRepository;
import com.tailorplatform.backend.specification.TailorSearchSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TailorProfileService {

    private final TailorProfileRepository tailorProfileRepository;
    private final UserRepository          userRepository;
    private final NotificationService     notificationService;

    public TailorProfileResponse createProfile(TailorProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (tailorProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Tailor profile already exists for this user");
        }

        TailorProfile profile = TailorProfile.builder()
                .user(user)
                .shopName(request.getShopName())
                .location(request.getLocation())
                .specialization(request.getSpecialization())
                .profileImage(request.getProfileImage())
                .build();

        return TailorProfileResponse.from(tailorProfileRepository.save(profile));
    }

    public TailorProfileResponse getProfile(Long id) {
        TailorProfile profile = tailorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tailor profile not found"));
        return TailorProfileResponse.from(profile);
    }

    public List<TailorProfileResponse> getAllProfiles() {
        return tailorProfileRepository.findAll()
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    public List<TailorProfileResponse> searchByLocation(String location) {
        return tailorProfileRepository.findByLocationContainingIgnoreCase(location)
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    public List<TailorProfileResponse> searchBySpecialization(String specialization) {
        return tailorProfileRepository.findBySpecializationContainingIgnoreCase(specialization)
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    public TailorProfileResponse getProfileByUserId(Long userId) {
        TailorProfile profile = tailorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("No tailor profile found for user: " + userId));
        return TailorProfileResponse.from(profile);
    }

    public TailorProfileResponse updateProfile(Long id, TailorProfileRequest request) {
        TailorProfile profile = tailorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tailor profile not found"));

        profile.setShopName(request.getShopName());
        profile.setLocation(request.getLocation());
        profile.setSpecialization(request.getSpecialization());
        profile.setProfileImage(request.getProfileImage());

        return TailorProfileResponse.from(tailorProfileRepository.save(profile));
    }

    // ─── Verification flow ────────────────────────────────────────────────────

    /** Tailor submits portfolio + document for admin review */
    public TailorProfileResponse submitVerification(Long tailorId, TailorVerificationRequest req) {
        TailorProfile profile = tailorProfileRepository.findById(tailorId)
                .orElseThrow(() -> new IllegalArgumentException("Tailor profile not found: " + tailorId));

        if ("APPROVED".equals(profile.getVerificationStatus())) {
            throw new IllegalStateException("Tailor is already verified.");
        }

        profile.setPortfolioUrls(req.getPortfolioUrls());
        profile.setShopDocumentUrl(req.getShopDocumentUrl());
        profile.setVerificationStatus("PENDING");
        profile.setVerificationRequestedAt(LocalDateTime.now());

        return TailorProfileResponse.from(tailorProfileRepository.save(profile));
    }

    /** Admin approves or rejects a tailor verification request */
    public TailorProfileResponse reviewVerification(Long tailorId, String decision, String note) {
        TailorProfile profile = tailorProfileRepository.findById(tailorId)
                .orElseThrow(() -> new IllegalArgumentException("Tailor profile not found: " + tailorId));

        String status = switch (decision.toUpperCase()) {
            case "APPROVE" -> "APPROVED";
            case "REJECT"  -> "REJECTED";
            default -> throw new IllegalArgumentException("Decision must be APPROVE or REJECT");
        };

        profile.setVerificationStatus(status);
        profile.setVerificationNote(note);
        TailorProfile saved = tailorProfileRepository.save(profile);

        // Notify the tailor
        Long tailorUserId = saved.getUser() != null ? saved.getUser().getId() : null;
        if ("APPROVED".equals(status)) {
            notificationService.send(tailorUserId,
                    "Congratulations! Your tailor profile has been verified. Your shop now shows a verified badge.");
        } else {
            notificationService.send(tailorUserId,
                    "Your verification request was not approved. Reason: " + (note != null ? note : "Please contact support."));
        }

        return TailorProfileResponse.from(saved);
    }

    /** All tailors with PENDING verification (for admin panel) */
    public List<TailorProfileResponse> getPendingVerifications() {
        return tailorProfileRepository.findByVerificationStatus("PENDING")
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    // ─── Advanced Search ──────────────────────────────────────────────────────

    /**
     * Paginated, filterable tailor search using JPA Specification.
     *
     * @param keyword        free-text across shopName / specialization / location
     * @param location       filter by location substring
     * @param specialization filter by specialization substring
     * @param minRating      minimum rating (e.g. 3.0)
     * @param verifiedOnly   if true, only return APPROVED tailors
     * @param page           0-based page number
     * @param size           page size (max 50)
     * @param sortBy         field to sort by ("rating", "shopName") — default "rating"
     */
    public PagedResponse<TailorProfileResponse> searchTailors(
            String keyword,
            String location,
            String specialization,
            BigDecimal minRating,
            boolean verifiedOnly,
            int page,
            int size,
            String sortBy) {

        // Cap page size to prevent abuse
        int safeSize = Math.min(size, 50);
        String safeSort = (sortBy != null && List.of("rating", "shopName", "location").contains(sortBy))
                ? sortBy : "rating";

        Pageable pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, safeSort));

        Specification<TailorProfile> spec = TailorSearchSpecification.build(
                keyword, location, specialization, minRating, verifiedOnly);

        Page<TailorProfile> result = tailorProfileRepository.findAll(spec, pageable);

        return PagedResponse.<TailorProfileResponse>builder()
                .content(result.getContent().stream().map(TailorProfileResponse::from).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }
}
