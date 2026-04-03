package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Measurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(precision = 5, scale = 2)
    private BigDecimal chest;

    @Column(precision = 5, scale = 2)
    private BigDecimal waist;

    @Column(precision = 5, scale = 2)
    private BigDecimal sleeve;

    @Column(precision = 5, scale = 2)
    private BigDecimal neck;

    @Column(precision = 5, scale = 2)
    private BigDecimal trouserLength;

    private String bodyReferenceImage;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
