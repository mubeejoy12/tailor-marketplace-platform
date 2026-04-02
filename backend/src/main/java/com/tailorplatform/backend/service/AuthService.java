package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.RegisterRequest;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // 🔥 FIXED
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        return userRepository.save(user);
    }
}