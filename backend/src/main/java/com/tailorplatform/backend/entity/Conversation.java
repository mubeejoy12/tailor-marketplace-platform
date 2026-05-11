package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations", uniqueConstraints = {
        // one conversation thread per customer↔tailor pair
        @UniqueConstraint(columnNames = {"customer_id", "tailor_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "tailor_id", nullable = false)
    private Long tailorId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /** Denormalised last-message text for conversation list preview */
    @Column(columnDefinition = "TEXT")
    private String lastMessage;

    private LocalDateTime lastMessageAt;
}
