package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.Order;
import lombok.Builder;
import lombok.Data;

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

    public static OrderResponse from(Order order) {
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
                .build();
    }
}
