package com.tailorplatform.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class OrderRequest {
    private Long userId;
    private Long tailorId;
    private Long measurementId;
    private String styleChoice;
    private String fabricChoice;
    private Double amount;
    private LocalDate deliveryDate;
}
