package com.tailorplatform.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tailorplatform.backend.dto.PaymentInitResponse;
import com.tailorplatform.backend.dto.PaymentRequest;
import com.tailorplatform.backend.dto.PaymentVerifyResponse;
import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.repository.OrderRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${paystack.secret-key}")
    private String paystackSecretKey;

    @Value("${paystack.base-url}")
    private String paystackBaseUrl;

    @Value("${paystack.callback-url}")
    private String callbackUrl;

    // ─── Paystack API shapes ──────────────────────────────────────────────────

    @Data
    static class PaystackInitData {
        @JsonProperty("authorization_url") private String authorizationUrl;
        @JsonProperty("access_code")       private String accessCode;
        private String reference;
    }

    @Data
    static class PaystackInitApiResponse {
        private boolean status;
        private String message;
        private PaystackInitData data;
    }

    @Data
    static class PaystackVerifyData {
        private String status;        // "success" | "failed" | "abandoned"
        private String reference;
        private long amount;          // in kobo
        @JsonProperty("gateway_response") private String gatewayResponse;
        private Map<String, Object> metadata; // contains our orderId
    }

    @Data
    static class PaystackVerifyApiResponse {
        private boolean status;
        private String message;
        private PaystackVerifyData data;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private HttpHeaders paystackHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + paystackSecretKey);
        return headers;
    }

    private String generateReference() {
        return "TAILOR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    // ─── Initialize ──────────────────────────────────────────────────────────

    public PaymentInitResponse initializePayment(PaymentRequest req) {
        log.info("Initializing Paystack payment — orderId={} email={} amount={}",
                req.getOrderId(), req.getEmail(), req.getAmount());

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        // Duplicate payment guard
        if ("PAID".equals(order.getPaymentStatus())) {
            throw new IllegalStateException("Order " + req.getOrderId() + " has already been paid.");
        }

        String reference = generateReference();
        // Paystack requires amount in kobo (Naira × 100)
        long amountInKobo = Math.round(req.getAmount() * 100);

        // Embed orderId in Paystack metadata — survives even if callback URL params are lost
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("orderId",      req.getOrderId());
        metadata.put("cancel_action", callbackUrl + "?orderId=" + req.getOrderId() + "&status=cancelled");

        Map<String, Object> body = new HashMap<>();
        body.put("email",        req.getEmail());
        body.put("amount",       amountInKobo);
        body.put("reference",    reference);
        body.put("callback_url", callbackUrl + "?orderId=" + req.getOrderId());
        body.put("metadata",     metadata);

        log.debug("Paystack init request body: email={} amount={} kobo reference={} callback={}",
                req.getEmail(), amountInKobo, reference, callbackUrl + "?orderId=" + req.getOrderId());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, paystackHeaders());

        ResponseEntity<PaystackInitApiResponse> response;
        try {
            response = restTemplate.exchange(
                    paystackBaseUrl + "/transaction/initialize",
                    HttpMethod.POST,
                    entity,
                    PaystackInitApiResponse.class
            );
        } catch (ResourceAccessException e) {
            // I/O / DNS / timeout errors — the root cause is in e.getMessage()
            log.error("Cannot reach Paystack (check internet/DNS): {}", e.getMessage());
            throw new RuntimeException(
                    "Cannot reach Paystack payment service. Check network connectivity: " + e.getMessage(), e);
        } catch (HttpClientErrorException e) {
            // 4xx — bad request, invalid key, etc.
            log.error("Paystack 4xx error: status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Paystack rejected the request (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (HttpServerErrorException e) {
            // 5xx — Paystack side error
            log.error("Paystack 5xx error: status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Paystack server error — please retry later.", e);
        }

        PaystackInitApiResponse apiResp = response.getBody();
        if (apiResp == null || !apiResp.isStatus() || apiResp.getData() == null) {
            log.error("Paystack returned unexpected body: {}", apiResp);
            throw new RuntimeException("Paystack initialization returned an invalid response.");
        }

        // Persist reference so webhook can find this order later
        order.setPaymentReference(reference);
        orderRepository.save(order);

        log.info("Paystack init successful — reference={} authUrl={}",
                reference, apiResp.getData().getAuthorizationUrl());

        return PaymentInitResponse.builder()
                .authorizationUrl(apiResp.getData().getAuthorizationUrl())
                .reference(reference)
                .orderId(req.getOrderId())
                .build();
    }

    // ─── Verify ──────────────────────────────────────────────────────────────

    public PaymentVerifyResponse verifyPayment(String reference, Long orderId) {
        log.info("Verifying Paystack payment — reference={} orderId={}", reference, orderId);

        HttpEntity<Void> entity = new HttpEntity<>(paystackHeaders());

        ResponseEntity<PaystackVerifyApiResponse> response;
        try {
            response = restTemplate.exchange(
                    paystackBaseUrl + "/transaction/verify/" + reference,
                    HttpMethod.GET,
                    entity,
                    PaystackVerifyApiResponse.class
            );
        } catch (ResourceAccessException e) {
            log.error("Cannot reach Paystack for verification: {}", e.getMessage());
            throw new RuntimeException("Cannot reach Paystack — please retry: " + e.getMessage(), e);
        } catch (HttpClientErrorException e) {
            log.error("Paystack verify 4xx: status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Verification failed (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        }

        PaystackVerifyApiResponse apiResp = response.getBody();
        if (apiResp == null || !apiResp.isStatus() || apiResp.getData() == null) {
            throw new RuntimeException("Paystack verification returned an invalid response.");
        }

        PaystackVerifyData data = apiResp.getData();
        boolean paid = "success".equalsIgnoreCase(data.getStatus());
        log.info("Paystack verify result — reference={} paystackStatus={} paid={}",
                reference, data.getStatus(), paid);

        // Locate order — priority: reference on order → orderId param → Paystack metadata
        Long metadataOrderId = null;
        if (data.getMetadata() != null) {
            Object raw = data.getMetadata().get("orderId");
            if (raw instanceof Number n) metadataOrderId = n.longValue();
        }
        final Long resolvedFromMetadata = metadataOrderId;

        Order order = orderRepository.findByPaymentReference(reference)
                .or(() -> Optional.ofNullable(orderId).flatMap(orderRepository::findById))
                .or(() -> Optional.ofNullable(resolvedFromMetadata).flatMap(orderRepository::findById))
                .orElse(null);

        // Idempotent status update
        if (paid && order != null && !"PAID".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("PAID");
            order.setOrderStatus("IN_PROGRESS");
            orderRepository.save(order);
            log.info("Order {} updated → paymentStatus=PAID orderStatus=IN_PROGRESS", order.getId());
        }

        return PaymentVerifyResponse.builder()
                .success(paid)
                .status(data.getStatus())
                .reference(reference)
                .orderId(order != null ? order.getId() : orderId)
                .orderStatus(order != null ? order.getOrderStatus() : null)
                .paymentStatus(order != null ? order.getPaymentStatus() : null)
                .message(paid ? "Payment successful" : "Payment " + data.getStatus())
                .build();
    }

    // ─── Webhook ─────────────────────────────────────────────────────────────

    /**
     * Validate Paystack webhook HMAC-SHA512 signature.
     * Paystack sends x-paystack-signature = hex(HMAC-SHA512(rawBody, secretKey))
     */
    public boolean isValidWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(paystackSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            boolean valid = hex.toString().equals(signature);
            if (!valid) log.warn("Webhook signature mismatch — possible spoofing attempt.");
            return valid;
        } catch (Exception e) {
            log.error("Error validating webhook signature: {}", e.getMessage());
            return false;
        }
    }

    /** Safety-net: process charge.success webhook in case the redirect callback was missed */
    public void processWebhookEvent(Map<String, Object> event) {
        String eventType = (String) event.get("event");
        log.info("Paystack webhook received — event={}", eventType);

        if (!"charge.success".equals(eventType)) return;

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data == null) return;

        String reference = (String) data.get("reference");
        if (reference == null || reference.isBlank()) return;

        orderRepository.findByPaymentReference(reference).ifPresent(order -> {
            if (!"PAID".equals(order.getPaymentStatus())) {
                order.setPaymentStatus("PAID");
                order.setOrderStatus("IN_PROGRESS");
                orderRepository.save(order);
                log.info("Webhook updated order {} → PAID / IN_PROGRESS", order.getId());
            }
        });
    }
}
