package com.tailorplatform.backend.config;

import com.tailorplatform.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── Public ──────────────────────────────────────────────────────
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                // Paystack calls this server-to-server; it is authenticated by HMAC signature
                .requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()
                // Stateless calculator used by the measurement wizard before sign-up
                .requestMatchers(HttpMethod.POST, "/api/measurements/ai-suggest").permitAll()
                // Marketplace browsing
                .requestMatchers(HttpMethod.GET,
                        "/api/tailors", "/api/tailors/{id}", "/api/tailors/user/{userId}",
                        "/api/tailors/search", "/api/tailors/search/**",
                        "/api/designs", "/api/designs/**",
                        "/api/reviews/tailor/**", "/api/reviews/order/{orderId}/exists",
                        "/api/recommendations", "/api/site-content").permitAll()

                // ── Admin ───────────────────────────────────────────────────────
                .requestMatchers("/api/admin/**", "/api/analytics/admin").hasRole("ADMIN")

                // ── Tailor (ownership of the specific profile is checked in the services) ──
                .requestMatchers("/api/analytics/tailor/**").hasAnyRole("TAILOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/tailors", "/api/tailors/**").hasAnyRole("TAILOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/api/tailors/**").hasAnyRole("TAILOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/api/orders/{orderId}/status").hasAnyRole("TAILOR", "ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/designs/**").hasAnyRole("TAILOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/designs/**").hasAnyRole("TAILOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/designs/**").hasAnyRole("TAILOR", "ADMIN")

                // ── Everything else needs a logged-in user; services check ownership ──
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) ->
                    writeError(res, HttpStatus.UNAUTHORIZED, "Authentication required. Please log in."))
                .accessDeniedHandler((req, res, e) ->
                    writeError(res, HttpStatus.FORBIDDEN, "You do not have permission to perform this action."))
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void writeError(jakarta.servlet.http.HttpServletResponse res,
                                   HttpStatus status, String message) throws java.io.IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.getWriter().write("{\"error\":\"" + message + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
