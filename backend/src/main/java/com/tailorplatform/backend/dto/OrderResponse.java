package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.entity.TailorProfile;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponse {

    private Long id;
    private Long userId;
    private Long tailorId;
    private Long measurementId;
    private String styleChoice;
    private String fabricChoice;
    private Double amount;
    private String paymentReference;
    private String paymentStatus;
    private String orderStatus;
    private LocalDate deliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Enriched tailor info — populated when a TailorProfile is available
    private String tailorShopName;
    private String tailorLocation;
    private String tailorSpecialization;
    private BigDecimal tailorRating;

    /** Basic factory — no tailor info (used for list endpoints where bulk lookup is not needed) */
    public static OrderResponse from(Order order) {
        return from(order, null);
    }

    /** Enriched factory — includes tailor display info for detail/tracking views */
    public static OrderResponse from(Order order, TailorProfile tailor) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .tailorId(order.getTailorId())
                .measurementId(order.getMeasurementId())
                .styleChoice(order.getStyleChoice())
                .fabricChoice(order.getFabricChoice())
                .amount(order.getAmount())
                .paymentReference(order.getPaymentReference())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .deliveryDate(order.getDeliveryDate())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                // tailor fields — null-safe
                .tailorShopName(tailor != null ? tailor.getShopName() : null)
                .tailorLocation(tailor != null ? tailor.getLocation() : null)
                .tailorSpecialization(tailor != null ? tailor.getSpecialization() : null)
                .tailorRating(tailor != null ? tailor.getRating() : null)
                .build();
    }
}
