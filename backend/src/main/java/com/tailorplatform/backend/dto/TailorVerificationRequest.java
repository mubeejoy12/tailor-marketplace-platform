package com.tailorplatform.backend.dto;

import lombok.Data;

@Data
public class TailorVerificationRequest {

    /** Comma-separated portfolio image URLs */
    private String portfolioUrls;

    /** URL of the uploaded shop/trade document */
    private String shopDocumentUrl;
}
