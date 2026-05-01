package com.tailorplatform.backend.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private String email;
    /** Amount in Naira (kobo conversion handled in service) */
    private Double amount;
}
