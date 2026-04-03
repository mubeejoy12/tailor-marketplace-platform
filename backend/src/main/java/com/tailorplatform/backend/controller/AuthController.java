package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.LoginRequest;
import com.tailorplatform.backend.dto.RegisterRequest;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}