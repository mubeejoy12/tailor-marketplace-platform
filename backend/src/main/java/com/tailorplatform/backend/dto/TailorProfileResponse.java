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

    // ─── Verification ──────────────────────────────────────────────────────────
    private String verificationStatus;   // UNVERIFIED | PENDING | APPROVED | REJECTED
    private String portfolioUrls;
    private String shopDocumentUrl;
    private String verificationNote;

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
                .portfolioUrls(profile.getPortfolioUrls())
                .shopDocumentUrl(profile.getShopDocumentUrl())
                .verificationNote(profile.getVerificationNote())
                .build();
    }
}
