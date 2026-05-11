package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTailorIdOrderByCreatedAtDesc(Long tailorId);
    Optional<Review> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
    List<Review> findByUserId(Long userId);
}
