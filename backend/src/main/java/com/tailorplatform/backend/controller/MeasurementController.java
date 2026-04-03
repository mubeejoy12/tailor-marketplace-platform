package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.MeasurementRequest;
import com.tailorplatform.backend.entity.Measurement;
import com.tailorplatform.backend.service.MeasurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
public class MeasurementController {

    private final MeasurementService measurementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Measurement saveMeasurement(@RequestBody MeasurementRequest request) {
        return measurementService.saveMeasurement(request);
    }

    @GetMapping("/user/{userId}")
    public List<Measurement> getMeasurementsByUser(@PathVariable Long userId) {
        return measurementService.getMeasurementsByUser(userId);
    }

    @GetMapping("/{id}")
    public Measurement getMeasurement(@PathVariable Long id) {
        return measurementService.getMeasurement(id);
    }

    @PutMapping("/{id}")
    public Measurement updateMeasurement(@PathVariable Long id, @RequestBody MeasurementRequest request) {
        return measurementService.updateMeasurement(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeasurement(@PathVariable Long id) {
        measurementService.deleteMeasurement(id);
    }
}
