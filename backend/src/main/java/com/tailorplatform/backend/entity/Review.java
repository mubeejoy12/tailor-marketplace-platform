package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = {
        // one review per order (enforced at DB + service layer)
        @UniqueConstraint(columnNames = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The customer who wrote the review */
    @Column(nullable = false)
    private Long userId;

    /** The tailor being reviewed */
    @Column(nullable = false)
    private Long tailorId;

    /** The completed order this review is tied to */
    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    /** Rating 1–5 */
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
