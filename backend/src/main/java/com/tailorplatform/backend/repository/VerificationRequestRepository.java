package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {

    /** All requests for a specific tailor, newest first */
    List<VerificationRequest> findByTailorIdOrderBySubmittedAtDesc(Long tailorId);

    /** All requests with a given status, newest first */
    List<VerificationRequest> findByStatusOrderBySubmittedAtDesc(String status);

    /** All requests regardless of status, newest first */
    List<VerificationRequest> findAllByOrderBySubmittedAtDesc();

    /** Check if a tailor already has an open (PENDING) request */
    boolean existsByTailorIdAndStatus(Long tailorId, String status);

    /** Most recent request for a tailor */
    Optional<VerificationRequest> findFirstByTailorIdOrderBySubmittedAtDesc(Long tailorId);

    /** Count by status — used in admin metrics */
    long countByStatus(String status);
}
