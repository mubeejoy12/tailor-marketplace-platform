package com.tailorplatform.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * One admin-editable piece of site content, e.g. {@code hero.imageUrl} or
 * {@code category.Agbada.imageUrl}. Stored as key/value so new slots need no schema change.
 */
@Entity
@Table(name = "site_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String contentKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentValue;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
