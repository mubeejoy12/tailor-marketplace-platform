package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.VerificationDecisionRequest;
import com.tailorplatform.backend.dto.VerificationRequestResponse;
import com.tailorplatform.backend.dto.VerificationSubmitRequest;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.entity.VerificationRequest;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import com.tailorplatform.backend.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    // Thresholds for automatic Premium promotion
    private static final int    PREMIUM_MIN_ORDERS = 20;
    private static final double PREMIUM_MIN_RATING = 4.5;

    private final VerificationRequestRepository verificationRepo;
    private final TailorProfileRepository       tailorRepo;
    private final NotificationService           notificationService;

    // ─── Submit verification request (tailor action) ──────────────────────────

    /**
     * A tailor submits identity documents for admin review.
     * Business rules:
     *  - Tailor profile must exist
     *  - Cannot submit while another PENDING request is open
     *  - Cannot re-submit if already APPROVED (verified)
     *  - Sets TailorProfile.verificationStatus = PENDING
     */
    @Transactional
    public VerificationRequestResponse submitRequest(VerificationSubmitRequest req) {

        TailorProfile tailor = tailorRepo.findById(req.getTailorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tailor profile not found: " + req.getTailorId()));

        // Guard: already verified
        if (Boolean.TRUE.equals(tailor.getVerified())) {
            throw new IllegalStateException("Your profile is already verified.");
        }

        // Guard: open request already exists
        if (verificationRepo.existsByTailorIdAndStatus(req.getTailorId(), "PENDING")) {
            throw new IllegalStateException(
                    "A verification request is already under review. Please wait for the outcome.");
        }

        // Create the verification request record
        VerificationRequest request = VerificationRequest.builder()
                .tailorId(req.getTailorId())
                .nationalIdNumber(req.getNationalIdNumber())
                .idDocumentUrl(req.getIdDocumentUrl())
                .selfieUrl(req.getSelfieUrl())
                .status("PENDING")
                .build();

        VerificationRequest saved = verificationRepo.save(request);
        log.info("Verification request submitted — tailorId={} reqId={}", req.getTailorId(), saved.getId());

        // Update TailorProfile verification status
        tailor.setVerificationStatus("PENDING");
        tailor.setVerificationRequestedAt(LocalDateTime.now());
        tailorRepo.save(tailor);

        return toResponse(saved, tailor);
    }

    // ─── Admin: list all verifications ────────────────────────────────────────

    public List<VerificationRequestResponse> getAllVerifications() {
        return verificationRepo.findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(r -> toResponse(r, resolveProfile(r.getTailorId())))
                .collect(Collectors.toList());
    }

    public List<VerificationRequestResponse> getPendingVerifications() {
        return verificationRepo.findByStatusOrderBySubmittedAtDesc("PENDING")
                .stream()
                .map(r -> toResponse(r, resolveProfile(r.getTailorId())))
                .collect(Collectors.toList());
    }

    // ─── Admin: approve ───────────────────────────────────────────────────────

    /**
     * Approves a verification request.
     * Side-effects:
     *  - VerificationRequest.status = APPROVED
     *  - TailorProfile.verified = true, verificationStatus = APPROVED
     *  - Premium eligibility check runs
     *  - Tailor receives a notification
     */
    @Transactional
    public VerificationRequestResponse approve(Long requestId, VerificationDecisionRequest decision) {

        VerificationRequest req = findRequest(requestId);
        assertPending(req);

        req.setStatus("APPROVED");
        req.setReviewedAt(LocalDateTime.now());
        req.setReviewNote(decision.getNote());
        verificationRepo.save(req);

        // Update tailor profile
        TailorProfile tailor = tailorRepo.findById(req.getTailorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tailor profile not found: " + req.getTailorId()));

        tailor.setVerified(true);
        tailor.setVerificationStatus("APPROVED");
        tailor.setVerificationNote(decision.getNote());
        checkAndSetPremium(tailor);
        tailorRepo.save(tailor);

        log.info("Verification APPROVED — tailorId={} reqId={}", req.getTailorId(), requestId);

        // Notify tailor
        Long userId = tailor.getUser() != null ? tailor.getUser().getId() : null;
        notificationService.send(userId,
                "🎉 Congratulations! Your identity has been verified. Your profile now shows a verified badge.");

        return toResponse(req, tailor);
    }

    // ─── Admin: reject ────────────────────────────────────────────────────────

    /**
     * Rejects a verification request.
     * Side-effects:
     *  - VerificationRequest.status = REJECTED
     *  - TailorProfile.verificationStatus = REJECTED (verified stays false)
     *  - Tailor receives a notification with the reason
     */
    @Transactional
    public VerificationRequestResponse reject(Long requestId, VerificationDecisionRequest decision) {

        VerificationRequest req = findRequest(requestId);
        assertPending(req);

        req.setStatus("REJECTED");
        req.setReviewedAt(LocalDateTime.now());
        req.setReviewNote(decision.getNote());
        verificationRepo.save(req);

        // Update tailor profile status
        TailorProfile tailor = tailorRepo.findById(req.getTailorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tailor profile not found: " + req.getTailorId()));

        tailor.setVerificationStatus("REJECTED");
        tailor.setVerificationNote(decision.getNote());
        tailorRepo.save(tailor);

        log.info("Verification REJECTED — tailorId={} reqId={}", req.getTailorId(), requestId);

        // Notify tailor
        Long userId = tailor.getUser() != null ? tailor.getUser().getId() : null;
        String reason = (decision.getNote() != null && !decision.getNote().isBlank())
                ? decision.getNote() : "Please contact support for details.";
        notificationService.send(userId,
                "Your verification request was not approved. Reason: " + reason
                + " You may resubmit after addressing the issue.");

        return toResponse(req, tailor);
    }

    // ─── Get latest request for a tailor ─────────────────────────────────────

    public VerificationRequestResponse getLatestForTailor(Long tailorId) {
        return verificationRepo.findFirstByTailorIdOrderBySubmittedAtDesc(tailorId)
                .map(r -> toResponse(r, resolveProfile(r.getTailorId())))
                .orElseThrow(() -> new IllegalArgumentException(
                        "No verification request found for tailor: " + tailorId));
    }

    // ─── Premium eligibility (called externally by OrderService/ReviewService) ─

    /**
     * Checks whether the tailor now qualifies for Premium status and updates
     * the TailorProfile accordingly.  Call this after:
     *  - An order is marked DELIVERED  (completedOrders changes)
     *  - A review is saved             (rating changes)
     *  - A verification is approved    (verified becomes true)
     *
     * Does NOT save — caller must persist the profile.
     */
    public void checkAndSetPremium(TailorProfile profile) {
        boolean eligible =
                Boolean.TRUE.equals(profile.getVerified())
                && (profile.getCompletedOrders() != null && profile.getCompletedOrders() >= PREMIUM_MIN_ORDERS)
                && (profile.getRating() != null
                        && profile.getRating().compareTo(BigDecimal.valueOf(PREMIUM_MIN_RATING)) >= 0);

        if (!profile.getPremium().equals(eligible)) {
            profile.setPremium(eligible);
            log.info("Tailor {} premium status → {}", profile.getId(), eligible);
        }
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private VerificationRequest findRequest(Long id) {
        return verificationRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Verification request not found: " + id));
    }

    private void assertPending(VerificationRequest req) {
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException(
                    "Request is already " + req.getStatus() + " and cannot be reviewed again.");
        }
    }

    private TailorProfile resolveProfile(Long tailorId) {
        return tailorRepo.findById(tailorId).orElse(null);
    }

    private VerificationRequestResponse toResponse(VerificationRequest req, TailorProfile tailor) {
        String shopName = tailor != null ? tailor.getShopName() : null;
        String location = tailor != null ? tailor.getLocation() : null;
        return VerificationRequestResponse.from(req, shopName, location);
    }
}
