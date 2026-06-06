package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tailors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TailorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String shopName;

    @Column(nullable = false)
    private String location;

    private String specialization;

    @Builder.Default
    @Column(precision = 2, scale = 1)
    private BigDecimal rating = BigDecimal.ZERO;

    private String profileImage;

    // ─── Verification ──────────────────────────────────────────────────────────
    // Lifecycle: UNVERIFIED → PENDING (tailor submits) → APPROVED | REJECTED (admin acts)

    @Builder.Default
    @Column(nullable = false)
    private String verificationStatus = "UNVERIFIED";

    /** True once admin has approved a VerificationRequest for this tailor */
    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = false;

    /**
     * True when verified=true AND completedOrders >= 20 AND rating >= 4.5.
     * Recalculated automatically after each delivered order or review.
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean premium = false;

    /** Cached count of DELIVERED orders — updated by OrderService */
    @Builder.Default
    @Column(nullable = false)
    private Integer completedOrders = 0;

    /** Cached total review count — updated by ReviewService */
    @Builder.Default
    @Column(nullable = false)
    private Integer totalReviews = 0;

    /** Comma-separated portfolio image URLs submitted by the tailor */
    @Column(columnDefinition = "TEXT")
    private String portfolioUrls;

    /** URL of the shop/trade document the tailor uploaded */
    private String shopDocumentUrl;

    /** Admin note when approving or rejecting */
    @Column(columnDefinition = "TEXT")
    private String verificationNote;

    private LocalDateTime verificationRequestedAt;

    // ─── Timestamps ────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
