package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.TailorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TailorProfileRepository extends JpaRepository<TailorProfile, Long>,
        JpaSpecificationExecutor<TailorProfile> {

    Optional<TailorProfile> findByUserId(Long userId);

    List<TailorProfile> findByLocationContainingIgnoreCase(String location);

    List<TailorProfile> findBySpecializationContainingIgnoreCase(String specialization);

    List<TailorProfile> findByVerificationStatus(String verificationStatus);

    long countByVerificationStatus(String verificationStatus);

    /** Sum of paid order amounts for revenue metrics */
    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o WHERE o.paymentStatus = 'PAID'")
    Double sumPaidOrderAmounts();
}
