package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.AIMeasurementRequest;
import com.tailorplatform.backend.dto.AIMeasurementResponse;
import com.tailorplatform.backend.service.AIMeasurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIMeasurementController {

    private final AIMeasurementService aiMeasurementService;

    /**
     * POST /api/measurements/ai-suggest
     *
     * Accepts height, weight and body-shape hint; returns AI-generated
     * measurement suggestions with a confidence score and reasoning text.
     * The client should display suggestions as editable defaults, not final values.
     */
    @PostMapping("/ai-suggest")
    public ResponseEntity<AIMeasurementResponse> suggest(
            @Valid @RequestBody AIMeasurementRequest request) {

        AIMeasurementResponse response = aiMeasurementService.suggest(request);
        return ResponseEntity.ok(response);
    }
}
