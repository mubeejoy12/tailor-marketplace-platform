package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OrderRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "tailorId is required")
    private Long tailorId;

    @NotNull(message = "measurementId is required — add measurements before placing an order")
    private Long measurementId;

    @NotBlank(message = "styleChoice is required")
    private String styleChoice;

    @NotBlank(message = "fabricChoice is required")
    private String fabricChoice;

    @Positive(message = "amount must be a positive number")
    private Double amount;

    private LocalDate deliveryDate;
}
