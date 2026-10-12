package com.tailorplatform.backend.security;

import com.tailorplatform.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads a {@code Bearer} token from the Authorization header and, when it is valid,
 * populates the SecurityContext with an {@link AuthenticatedUser} and a ROLE_ authority.
 *
 * <p>Requests without a token (or with an invalid one) continue unauthenticated;
 * {@link com.tailorplatform.backend.config.SecurityConfig} decides which routes require auth.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtService.parseToken(header.substring(BEARER_PREFIX.length()));
                Long   userId = claims.get("userId", Long.class);
                String role   = claims.get("role", String.class);

                if (userId != null && role != null) {
                    AuthenticatedUser principal = new AuthenticatedUser(userId, claims.getSubject(), role);
                    var auth = new UsernamePasswordAuthenticationToken(
                            principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (JwtException | IllegalArgumentException ex) {
                log.debug("Ignoring invalid JWT: {}", ex.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}
