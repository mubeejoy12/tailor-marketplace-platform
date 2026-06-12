package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Returned by both /api/auth/register and /api/auth/login.
 * Contains the JWT token and the essential user fields the
 * frontend needs to hydrate auth state — no password hash is included.
 */
@Data
@Builder
public class AuthResponse {
    private String token;
    private Long   userId;
    private String email;
    private String fullName;
    private String role;
}
