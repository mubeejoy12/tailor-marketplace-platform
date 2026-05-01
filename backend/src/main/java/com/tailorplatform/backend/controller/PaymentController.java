package com.tailorplatform.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tailorplatform.backend.dto.PaymentInitResponse;
import com.tailorplatform.backend.dto.PaymentRequest;
import com.tailorplatform.backend.dto.PaymentVerifyResponse;
import com.tailorplatform.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    /**
     * Initialize a Paystack transaction.
     * Returns { authorizationUrl, reference, orderId }
     */
    @PostMapping("/initialize")
    public ResponseEntity<PaymentInitResponse> initialize(@RequestBody PaymentRequest req) {
        return ResponseEntity.ok(paymentService.initializePayment(req));
    }

    /**
     * Verify a Paystack transaction by reference.
     * Called by the frontend callback page after Paystack redirects back.
     */
    @GetMapping("/verify")
    public ResponseEntity<PaymentVerifyResponse> verify(
            @RequestParam String reference,
            @RequestParam(required = false) Long orderId) {
        return ResponseEntity.ok(paymentService.verifyPayment(reference, orderId));
    }

    /**
     * Paystack webhook — receives charge events server-to-server.
     * Validates HMAC-SHA512 signature before processing.
     * Raw body consumed as String to allow signature verification.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestHeader(value = "x-paystack-signature", required = false) String signature,
            @RequestBody String rawBody) {

        if (signature == null || !paymentService.isValidWebhookSignature(rawBody, signature)) {
            return ResponseEntity.status(401).build();
        }

        try {
            Map<String, Object> event = objectMapper.readValue(
                    rawBody, new TypeReference<Map<String, Object>>() {});
            paymentService.processWebhookEvent(event);
        } catch (Exception ignored) {
            // Never fail Paystack — always return 200 to acknowledge receipt
        }

        return ResponseEntity.ok().build();
    }
}
