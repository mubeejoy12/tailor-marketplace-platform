package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.MeasurementRequest;
import com.tailorplatform.backend.entity.Measurement;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.MeasurementRepository;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final UserRepository userRepository;

    public Measurement saveMeasurement(MeasurementRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Measurement measurement = Measurement.builder()
                .user(user)
                .chest(request.getChest())
                .waist(request.getWaist())
                .sleeve(request.getSleeve())
                .neck(request.getNeck())
                .trouserLength(request.getTrouserLength())
                .bodyReferenceImage(request.getBodyReferenceImage())
                .build();

        return measurementRepository.save(measurement);
    }

    public List<Measurement> getMeasurementsByUser(Long userId) {
        return measurementRepository.findByUserId(userId);
    }

    public Measurement getMeasurement(Long id) {
        return measurementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Measurement not found"));
    }

    public Measurement updateMeasurement(Long id, MeasurementRequest request) {
        Measurement measurement = measurementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Measurement not found"));

        measurement.setChest(request.getChest());
        measurement.setWaist(request.getWaist());
        measurement.setSleeve(request.getSleeve());
        measurement.setNeck(request.getNeck());
        measurement.setTrouserLength(request.getTrouserLength());
        measurement.setBodyReferenceImage(request.getBodyReferenceImage());

        return measurementRepository.save(measurement);
    }

    public void deleteMeasurement(Long id) {
        measurementRepository.deleteById(id);
    }
}
