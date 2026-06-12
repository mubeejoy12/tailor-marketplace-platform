package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.TailorProfile;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TailorProfileResponse {

    private Long id;
    private Long userId;
    private String shopName;
    private String location;
    private String specialization;
    private BigDecimal rating;
    private String profileImage;

    // ─── Verification & Trust ──────────────────────────────────────────────────
    private String  verificationStatus;  // UNVERIFIED | PENDING | APPROVED | REJECTED
    private Boolean verified;            // true once admin approves
    private Boolean premium;             // true when verified + completedOrders>=20 + rating>=4.5
    private Integer completedOrders;     // cached count of DELIVERED orders
    private Integer totalReviews;        // cached total review count
    private String  portfolioUrls;
    private String  shopDocumentUrl;
    private String  verificationNote;

    /** Convert entity → DTO. No entity references escape this class. */
    public static TailorProfileResponse from(TailorProfile profile) {
        return TailorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .shopName(profile.getShopName())
                .location(profile.getLocation())
                .specialization(profile.getSpecialization())
                .rating(profile.getRating() != null ? profile.getRating() : BigDecimal.ZERO)
                .profileImage(profile.getProfileImage())
                .verificationStatus(profile.getVerificationStatus())
                .verified(Boolean.TRUE.equals(profile.getVerified()))
                .premium(Boolean.TRUE.equals(profile.getPremium()))
                .completedOrders(profile.getCompletedOrders() != null ? profile.getCompletedOrders() : 0)
                .totalReviews(profile.getTotalReviews() != null ? profile.getTotalReviews() : 0)
                .portfolioUrls(profile.getPortfolioUrls())
                .shopDocumentUrl(profile.getShopDocumentUrl())
                .verificationNote(profile.getVerificationNote())
                .build();
    }
}
