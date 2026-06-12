package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit record for every tailor identity-verification submission.
 * A tailor may have multiple VerificationRequests over time
 * (e.g. resubmit after rejection), but only one can be PENDING at a time.
 *
 * Lifecycle:
 *   PENDING  → APPROVED  (admin action → sets TailorProfile.verified = true)
 *   PENDING  → REJECTED  (admin action → tailor may resubmit)
 */
@Entity
@Table(
    name = "verification_requests",
    indexes = {
        @Index(name = "idx_verreq_tailor_id", columnList = "tailor_id"),
        @Index(name = "idx_verreq_status",    columnList = "status"),
        @Index(name = "idx_verreq_submitted",  columnList = "submitted_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The tailor profile this request belongs to */
    @Column(name = "tailor_id", nullable = false)
    private Long tailorId;

    /** Government-issued national ID number */
    @Column(nullable = false)
    private String nationalIdNumber;

    /** Public URL of the scanned national ID / business certificate */
    @Column(nullable = false)
    private String idDocumentUrl;

    /** Public URL of the tailor's selfie (for identity match) */
    private String selfieUrl;

    /**
     * PENDING | APPROVED | REJECTED
     * Defaults to PENDING on creation.
     */
    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    /** Populated when admin acts on the request */
    private LocalDateTime reviewedAt;

    /** Optional admin note explaining approval or rejection reason */
    @Column(columnDefinition = "TEXT")
    private String reviewNote;
}
