package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.MeasurementRequest;
import com.tailorplatform.backend.dto.MeasurementResponse;
import com.tailorplatform.backend.service.MeasurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
public class MeasurementController {

    private final MeasurementService measurementService;

    @PostMapping
    public ResponseEntity<MeasurementResponse> saveMeasurement(@Valid @RequestBody MeasurementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(measurementService.saveMeasurement(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MeasurementResponse>> getMeasurementsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(measurementService.getMeasurementsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeasurementResponse> getMeasurement(@PathVariable Long id) {
        return ResponseEntity.ok(measurementService.getMeasurement(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeasurementResponse> updateMeasurement(
            @PathVariable Long id,
            @Valid @RequestBody MeasurementRequest request) {
        return ResponseEntity.ok(measurementService.updateMeasurement(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeasurement(@PathVariable Long id) {
        measurementService.deleteMeasurement(id);
        return ResponseEntity.noContent().build();
    }
}
