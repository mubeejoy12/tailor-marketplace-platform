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

    /** Convert entity → DTO in one place. No entity leaks past this line. */
    public static TailorProfileResponse from(TailorProfile profile) {
        return TailorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .shopName(profile.getShopName())
                .location(profile.getLocation())
                .specialization(profile.getSpecialization())
                .rating(profile.getRating() != null ? profile.getRating() : java.math.BigDecimal.ZERO)
                .profileImage(profile.getProfileImage())
                .build();
    }
}
