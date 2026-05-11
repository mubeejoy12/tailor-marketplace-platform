package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.AIMeasurementRequest;
import com.tailorplatform.backend.dto.AIMeasurementResponse;

/**
 * Abstraction for the AI measurement suggestion engine.
 *
 * <p>The active implementation is chosen via Spring's @Primary or @ConditionalOnProperty.
 * Swap {@link RuleBasedAIMeasurementService} for a real ML service (e.g. OpenAI vision,
 * a custom body-measurement model) without touching any controller or other service code.
 */
public interface AIMeasurementService {

    /**
     * Analyse the user's body data and return suggested measurements.
     *
     * @param request height, weight, body shape, optional reference image (base64)
     * @return measurement suggestions with a confidence score and reasoning
     */
    AIMeasurementResponse suggest(AIMeasurementRequest request);
}
