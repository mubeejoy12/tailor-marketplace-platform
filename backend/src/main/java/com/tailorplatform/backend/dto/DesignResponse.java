package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Design;
import com.tailorplatform.backend.entity.TailorProfile;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DesignResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Owning tailor summary — enough to render a catalog card without a second request
    private Long tailorId;
    private String tailorShopName;
    private String tailorLocation;
    private BigDecimal tailorRating;
    private Boolean tailorVerified;

    public static DesignResponse from(Design design) {
        TailorProfile tailor = design.getTailor();
        return DesignResponse.builder()
                .id(design.getId())
                .title(design.getTitle())
                .description(design.getDescription())
                .price(design.getPrice())
                .category(design.getCategory())
                .imageUrl(design.getImageUrl())
                .createdAt(design.getCreatedAt())
                .updatedAt(design.getUpdatedAt())
                .tailorId(tailor.getId())
                .tailorShopName(tailor.getShopName())
                .tailorLocation(tailor.getLocation())
                .tailorRating(tailor.getRating() != null ? tailor.getRating() : BigDecimal.ZERO)
                .tailorVerified(Boolean.TRUE.equals(tailor.getVerified()))
                .build();
    }
}
