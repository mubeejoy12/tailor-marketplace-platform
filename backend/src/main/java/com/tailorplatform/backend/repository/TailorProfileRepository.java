package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.TailorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TailorProfileRepository extends JpaRepository<TailorProfile, Long> {

    Optional<TailorProfile> findByUserId(Long userId);

    List<TailorProfile> findByLocationContainingIgnoreCase(String location);

    List<TailorProfile> findBySpecializationContainingIgnoreCase(String specialization);
}
