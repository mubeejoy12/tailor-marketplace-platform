package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Request body for POST /api/tailors/verification-request */
@Data
public class VerificationSubmitRequest {

    @NotNull(message = "tailorId is required")
    private Long tailorId;

    @NotBlank(message = "National ID number is required")
    private String nationalIdNumber;

    @NotBlank(message = "ID document URL is required")
    private String idDocumentUrl;

    /** Optional selfie URL */
    private String selfieUrl;
}
