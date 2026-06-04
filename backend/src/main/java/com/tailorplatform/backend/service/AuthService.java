package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.AuthResponse;
import com.tailorplatform.backend.dto.LoginRequest;
import com.tailorplatform.backend.dto.RegisterRequest;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtService        jwtService;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("An account with this email already exists.");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(
                saved.getEmail(),
                saved.getId(),
                saved.getRole() != null ? saved.getRole().name() : "CUSTOMER",
                saved.getFullName() != null ? saved.getFullName() : ""
        );

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole() != null ? saved.getRole().name() : "CUSTOMER")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole() != null ? user.getRole().name() : "CUSTOMER",
                user.getFullName() != null ? user.getFullName() : ""
        );

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().name() : "CUSTOMER")
                .build();
    }
}
