package com.tailorplatform.backend.security;

/**
 * Principal stored in the SecurityContext once a request's JWT has been verified.
 *
 * @param userId User account ID (the {@code userId} claim)
 * @param email  account email (the token subject)
 * @param role   CUSTOMER | TAILOR | ADMIN
 */
public record AuthenticatedUser(Long userId, String email, String role) {

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
