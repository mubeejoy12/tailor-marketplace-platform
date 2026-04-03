package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeasurementRepository extends JpaRepository<Measurement, Long> {

    List<Measurement> findByUserId(Long userId);
}
