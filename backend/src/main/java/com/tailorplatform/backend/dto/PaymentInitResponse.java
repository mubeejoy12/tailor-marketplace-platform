package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

/** Returned to the frontend after a successful Paystack initialization */
@Data
@Builder
public class PaymentInitResponse {
    private String authorizationUrl;
    private String reference;
    private Long orderId;
}
