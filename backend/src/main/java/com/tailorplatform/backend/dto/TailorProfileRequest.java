package com.tailorplatform.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TailorProfileRequest {
    private Long userId;
    private String shopName;
    private String location;
    private String specialization;
    private BigDecimal rating;
    private String profileImage;
}
