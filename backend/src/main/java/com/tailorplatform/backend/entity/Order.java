package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long tailorId;

    private Long measurementId;

    private String styleChoice;

    private String fabricChoice;

    private Double amount;

    /** Paystack transaction reference — set at payment initialization */
    @Column(unique = true)
    private String paymentReference;

    @Builder.Default
    @Column(nullable = false)
    private String paymentStatus = "PENDING";

    @Builder.Default
    @Column(nullable = false)
    private String orderStatus = "NEW";

    private LocalDate deliveryDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
