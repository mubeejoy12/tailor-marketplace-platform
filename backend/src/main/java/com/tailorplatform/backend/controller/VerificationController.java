package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.VerificationDecisionRequest;
import com.tailorplatform.backend.dto.VerificationRequestResponse;
import com.tailorplatform.backend.dto.VerificationSubmitRequest;
import com.tailorplatform.backend.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Handles the full tailor identity-verification lifecycle.
 *
 * Tailor endpoints  (auth required — must be TAILOR role):
 *   POST /api/tailors/verification-request        → submit docs for review
 *   GET  /api/tailors/{tailorId}/verification-request/latest → current status
 *
 * Admin endpoints (auth required — must be ADMIN role):
 *   GET  /api/admin/verifications                  → all requests (all statuses)
 *   GET  /api/admin/verifications/pending          → only PENDING
 *   PUT  /api/admin/verifications/{id}/approve     → approve request
 *   PUT  /api/admin/verifications/{id}/reject      → reject request
 */
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VerificationController {

    private final VerificationService verificationService;

    // ─── Tailor: submit verification request ─────────────────────────────────

    @PostMapping("/api/tailors/verification-request")
    public ResponseEntity<VerificationRequestResponse> submitRequest(
            @Valid @RequestBody VerificationSubmitRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(verificationService.submitRequest(req));
    }

    @GetMapping("/api/tailors/{tailorId}/verification-request/latest")
    public ResponseEntity<VerificationRequestResponse> getLatest(
            @PathVariable Long tailorId) {
        return ResponseEntity.ok(verificationService.getLatestForTailor(tailorId));
    }

    // ─── Admin: list verifications ────────────────────────────────────────────

    @GetMapping("/api/admin/verifications")
    public ResponseEntity<List<VerificationRequestResponse>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    @GetMapping("/api/admin/verifications/pending")
    public ResponseEntity<List<VerificationRequestResponse>> getPendingVerifications() {
        return ResponseEntity.ok(verificationService.getPendingVerifications());
    }

    // ─── Admin: approve ───────────────────────────────────────────────────────

    @PutMapping("/api/admin/verifications/{id}/approve")
    public ResponseEntity<VerificationRequestResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) VerificationDecisionRequest body) {
        VerificationDecisionRequest decision = body != null ? body : new VerificationDecisionRequest();
        return ResponseEntity.ok(verificationService.approve(id, decision));
    }

    // ─── Admin: reject ────────────────────────────────────────────────────────

    @PutMapping("/api/admin/verifications/{id}/reject")
    public ResponseEntity<VerificationRequestResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) VerificationDecisionRequest body) {
        VerificationDecisionRequest decision = body != null ? body : new VerificationDecisionRequest();
        return ResponseEntity.ok(verificationService.reject(id, decision));
    }
}
