package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.UserProfileRequest;
import com.tailorplatform.backend.dto.UserProfileResponse;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.UserRepository;
import com.tailorplatform.backend.security.AccessGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AccessGuard    accessGuard;

    public UserProfileResponse getProfile(Long userId) {
        accessGuard.requireSelf(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return UserProfileResponse.from(user);
    }

    public UserProfileResponse updateProfile(Long userId, UserProfileRequest req) {
        accessGuard.requireSelf(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setFullName(req.getFullName());
        if (req.getPhone()        != null) user.setPhone(req.getPhone());
        if (req.getLocation()     != null) user.setLocation(req.getLocation());
        if (req.getProfileImage() != null) user.setProfileImage(req.getProfileImage());

        User saved = userRepository.save(user);
        log.info("Profile updated for userId={}", userId);
        return UserProfileResponse.from(saved);
    }
}
