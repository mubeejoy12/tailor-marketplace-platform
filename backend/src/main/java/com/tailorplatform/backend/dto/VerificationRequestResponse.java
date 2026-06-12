package com.tailorplatform.backend.dto;

import com.tailorplatform.backend.entity.VerificationRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/** Response body returned for every VerificationRequest operation */
@Data
@Builder
public class VerificationRequestResponse {

    private Long   id;
    private Long   tailorId;
    private String tailorShopName;   // populated by service
    private String tailorLocation;   // populated by service
    private String nationalIdNumber;
    private String idDocumentUrl;
    private String selfieUrl;
    private String status;           // PENDING | APPROVED | REJECTED
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewNote;

    /** Build from entity + optional tailor name/location strings */
    public static VerificationRequestResponse from(
            VerificationRequest req,
            String shopName,
            String location) {
        return VerificationRequestResponse.builder()
                .id(req.getId())
                .tailorId(req.getTailorId())
                .tailorShopName(shopName)
                .tailorLocation(location)
                .nationalIdNumber(req.getNationalIdNumber())
                .idDocumentUrl(req.getIdDocumentUrl())
                .selfieUrl(req.getSelfieUrl())
                .status(req.getStatus())
                .submittedAt(req.getSubmittedAt())
                .reviewedAt(req.getReviewedAt())
                .reviewNote(req.getReviewNote())
                .build();
    }
}
