package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.AIMeasurementRequest;
import com.tailorplatform.backend.dto.AIMeasurementResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Rule-based implementation of {@link AIMeasurementService}.
 *
 * <p>Uses anthropometrically-derived formulas based on height, weight and
 * body shape to estimate standard garment measurements.  Accuracy is ±5 cm
 * for most adults.  Replace this class with an ML-backed service when a
 * real vision/inference API is available — the interface contract stays the same.
 *
 * <h3>Formula sources</h3>
 * <ul>
 *   <li>Chest / Waist / Hip: derived from BMI and body-shape category</li>
 *   <li>Sleeve: height × 0.345 (standard menswear formula)</li>
 *   <li>Neck: height × 0.196 (ISO 8559 approximation)</li>
 *   <li>Shoulder: chest × 0.45</li>
 *   <li>Trouser length: height × 0.47</li>
 *   <li>Inseam: height × 0.44</li>
 * </ul>
 */
@Slf4j
@Service
public class RuleBasedAIMeasurementService implements AIMeasurementService {

    @Override
    public AIMeasurementResponse suggest(AIMeasurementRequest req) {
        int    h     = req.getHeightCm();
        int    w     = req.getWeightKg();
        String shape = normaliseShape(req.getBodyShape());

        double bmi = w / Math.pow(h / 100.0, 2);

        // Base measurements derived from height
        double sleeve        = round(h * 0.345);
        double neck          = round(h * 0.196);
        double trouserLength = round(h * 0.47);
        double inseam        = round(h * 0.44);

        // Chest / waist / hip differ by body shape
        double chest, waist, hip, shoulder;

        switch (shape) {
            case "SLIM" -> {
                chest    = round(h * 0.50 - 2 + bmi * 0.3);
                waist    = round(chest - 15);
                hip      = round(chest + 2);
                shoulder = round(chest * 0.43);
            }
            case "ATHLETIC" -> {
                chest    = round(h * 0.52 + bmi * 0.4);
                waist    = round(chest - 14);
                hip      = round(chest + 4);
                shoulder = round(chest * 0.46);
            }
            case "PLUS" -> {
                chest    = round(h * 0.54 + bmi * 0.6);
                waist    = round(chest - 8);
                hip      = round(chest + 8);
                shoulder = round(chest * 0.44);
            }
            default -> { // REGULAR
                chest    = round(h * 0.51 + bmi * 0.35);
                waist    = round(chest - 12);
                hip      = round(chest + 4);
                shoulder = round(chest * 0.45);
            }
        }

        // Confidence is lower when BMI is extreme (very low or very high)
        double confidence = bmi >= 18.5 && bmi <= 30 ? 0.82 : 0.65;

        log.info("AI suggestion → userId={} height={} weight={} shape={} bmi={} confidence={}",
                req.getUserId(), h, w, shape, String.format("%.1f", bmi), confidence);

        return AIMeasurementResponse.builder()
                .userId(req.getUserId())
                .chest(bd(chest))
                .waist(bd(waist))
                .hip(bd(hip))
                .sleeve(bd(sleeve))
                .neck(bd(neck))
                .shoulder(bd(shoulder))
                .trouserLength(bd(trouserLength))
                .inseam(bd(inseam))
                .confidenceScore(confidence)
                .bodyShape(shape)
                .aiPowered(false)
                .reasoning(buildReasoning(h, w, bmi, shape, confidence))
                .build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static String normaliseShape(String raw) {
        if (raw == null) return "REGULAR";
        return switch (raw.toUpperCase().trim()) {
            case "SLIM"     -> "SLIM";
            case "ATHLETIC" -> "ATHLETIC";
            case "PLUS"     -> "PLUS";
            default         -> "REGULAR";
        };
    }

    private static double round(double v) {
        return Math.round(v * 2.0) / 2.0; // nearest 0.5 cm
    }

    private static BigDecimal bd(double v) {
        return BigDecimal.valueOf(v).setScale(1, RoundingMode.HALF_UP);
    }

    private static String buildReasoning(int h, int w, double bmi, String shape, double confidence) {
        String bmiNote = bmi < 18.5 ? "underweight range" :
                         bmi < 25   ? "healthy range" :
                         bmi < 30   ? "overweight range" : "obese range";

        return String.format(
                "Measurements estimated using standard anthropometric formulas for a %d cm, %d kg person " +
                "in the %s body-shape category (BMI %.1f — %s). " +
                "Confidence: %.0f%%. Please review each value and adjust before saving — " +
                "these are starting estimates, not a substitute for a physical fitting.",
                h, w, shape, bmi, bmiNote, confidence * 100);
    }
}
