package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.UserProfileRequest;
import com.tailorplatform.backend.dto.UserProfileResponse;
import com.tailorplatform.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /api/users/{id}/profile — fetch a user's public profile */
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    /** PUT /api/users/{id}/profile — update fullName, phone, location, profileImage */
    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UserProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(id, req));
    }
}
