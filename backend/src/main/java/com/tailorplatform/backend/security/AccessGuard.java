package com.tailorplatform.backend.security;

import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Ownership checks shared by the services. Route-level role rules live in
 * {@link com.tailorplatform.backend.config.SecurityConfig}; this class answers
 * "is the caller allowed to act on <em>this</em> user / tailor profile?".
 *
 * <p>Admins pass every check. Failures throw {@link AccessDeniedException} (→ 403).
 */
@Component
@RequiredArgsConstructor
public class AccessGuard {

    private final TailorProfileRepository tailorProfileRepository;

    /** The authenticated caller. Throws (→ 401) if the request carries no valid token. */
    public AuthenticatedUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required. Please log in.");
        }
        return user;
    }

    /** Caller is the given user account (or an admin). */
    public void requireSelf(Long userId) {
        AuthenticatedUser caller = currentUser();
        if (caller.isAdmin()) return;
        if (!Objects.equals(caller.userId(), userId)) {
            throw new AccessDeniedException("You can only access your own data.");
        }
    }

    /** True if the caller owns the tailor profile with this ID. */
    public boolean ownsTailorProfile(Long tailorProfileId) {
        if (tailorProfileId == null) return false;
        Long callerId = currentUser().userId();
        return tailorProfileRepository.findById(tailorProfileId)
                .map(TailorProfile::getUser)
                .map(u -> Objects.equals(u.getId(), callerId))
                .orElse(false);
    }

    /** Caller owns the tailor profile with this ID (or is an admin). */
    public void requireTailorOwner(Long tailorProfileId) {
        if (currentUser().isAdmin()) return;
        if (!ownsTailorProfile(tailorProfileId)) {
            throw new AccessDeniedException("You can only manage your own tailor profile.");
        }
    }
}
