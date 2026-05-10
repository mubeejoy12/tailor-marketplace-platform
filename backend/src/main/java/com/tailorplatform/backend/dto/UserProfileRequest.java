package com.tailorplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String location;
    private String profileImage;
}
