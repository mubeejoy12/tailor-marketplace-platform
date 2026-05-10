package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.MeasurementRequest;
import com.tailorplatform.backend.dto.MeasurementResponse;
import com.tailorplatform.backend.entity.Measurement;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.MeasurementRepository;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final UserRepository userRepository;

    public MeasurementResponse saveMeasurement(MeasurementRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

        Measurement measurement = Measurement.builder()
                .user(user)
                .chest(request.getChest())
                .waist(request.getWaist())
                .sleeve(request.getSleeve())
                .neck(request.getNeck())
                .shoulder(request.getShoulder())
                .hip(request.getHip())
                .trouserLength(request.getTrouserLength())
                .inseam(request.getInseam())
                .bodyReferenceImage(request.getBodyReferenceImage())
                .build();

        return MeasurementResponse.from(measurementRepository.save(measurement));
    }

    public List<MeasurementResponse> getMeasurementsByUser(Long userId) {
        return measurementRepository.findByUserId(userId).stream()
                .map(MeasurementResponse::from)
                .collect(Collectors.toList());
    }

    public MeasurementResponse getMeasurement(Long id) {
        Measurement m = measurementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Measurement not found: " + id));
        return MeasurementResponse.from(m);
    }

    public MeasurementResponse updateMeasurement(Long id, MeasurementRequest request) {
        Measurement m = measurementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Measurement not found: " + id));

        m.setChest(request.getChest());
        m.setWaist(request.getWaist());
        m.setSleeve(request.getSleeve());
        m.setNeck(request.getNeck());
        m.setShoulder(request.getShoulder());
        m.setHip(request.getHip());
        m.setTrouserLength(request.getTrouserLength());
        m.setInseam(request.getInseam());
        m.setBodyReferenceImage(request.getBodyReferenceImage());

        return MeasurementResponse.from(measurementRepository.save(m));
    }

    public void deleteMeasurement(Long id) {
        if (!measurementRepository.existsById(id)) {
            throw new IllegalArgumentException("Measurement not found: " + id);
        }
        measurementRepository.deleteById(id);
    }
}
