package com.tailorplatform.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MeasurementRequest {
    private Long userId;
    private BigDecimal chest;
    private BigDecimal waist;
    private BigDecimal sleeve;
    private BigDecimal neck;
    private BigDecimal trouserLength;
    private String bodyReferenceImage;
}
