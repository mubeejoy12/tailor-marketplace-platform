package com.tailorplatform.backend.dto;

import lombok.Data;

/** Request body for PUT /api/admin/verifications/{id}/approve|reject */
@Data
public class VerificationDecisionRequest {
    /** Optional admin note explaining the decision */
    private String note;
}
