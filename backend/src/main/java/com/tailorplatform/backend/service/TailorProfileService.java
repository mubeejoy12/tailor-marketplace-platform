package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.TailorProfileRequest;
import com.tailorplatform.backend.dto.TailorProfileResponse;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.entity.User;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import com.tailorplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TailorProfileService {

    private final TailorProfileRepository tailorProfileRepository;
    private final UserRepository userRepository;

    public TailorProfileResponse createProfile(TailorProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (tailorProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Tailor profile already exists for this user");
        }

        TailorProfile profile = TailorProfile.builder()
                .user(user)
                .shopName(request.getShopName())
                .location(request.getLocation())
                .specialization(request.getSpecialization())
                .profileImage(request.getProfileImage())
                .build();

        return TailorProfileResponse.from(tailorProfileRepository.save(profile));
    }

    public TailorProfileResponse getProfile(Long id) {
        TailorProfile profile = tailorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tailor profile not found"));
        return TailorProfileResponse.from(profile);
    }

    public List<TailorProfileResponse> getAllProfiles() {
        return tailorProfileRepository.findAll()
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    public List<TailorProfileResponse> searchByLocation(String location) {
        return tailorProfileRepository.findByLocationContainingIgnoreCase(location)
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    public List<TailorProfileResponse> searchBySpecialization(String specialization) {
        return tailorProfileRepository.findBySpecializationContainingIgnoreCase(specialization)
                .stream()
                .map(TailorProfileResponse::from)
                .toList();
    }

    public TailorProfileResponse updateProfile(Long id, TailorProfileRequest request) {
        TailorProfile profile = tailorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tailor profile not found"));

        profile.setShopName(request.getShopName());
        profile.setLocation(request.getLocation());
        profile.setSpecialization(request.getSpecialization());
        profile.setProfileImage(request.getProfileImage());

        return TailorProfileResponse.from(tailorProfileRepository.save(profile));
    }
}
