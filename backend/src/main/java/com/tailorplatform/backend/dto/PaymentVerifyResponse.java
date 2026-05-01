package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

/** Returned to the frontend after verification */
@Data
@Builder
public class PaymentVerifyResponse {
    private boolean success;
    private String status;      // Paystack transaction status e.g. "success"
    private String reference;
    private Long orderId;
    private String orderStatus;
    private String paymentStatus;
    private String message;
}
