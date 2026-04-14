package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.TailorProfileRequest;
import com.tailorplatform.backend.dto.TailorProfileResponse;
import com.tailorplatform.backend.service.TailorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tailors")
@RequiredArgsConstructor
public class TailorProfileController {

    private final TailorProfileService tailorProfileService;

    @PostMapping
    public TailorProfileResponse createProfile(@RequestBody TailorProfileRequest request) {
        return tailorProfileService.createProfile(request);
    }

    @GetMapping
    public List<TailorProfileResponse> getAllProfiles() {
        return tailorProfileService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public TailorProfileResponse getProfile(@PathVariable Long id) {
        return tailorProfileService.getProfile(id);
    }

    @GetMapping("/search/location")
    public List<TailorProfileResponse> searchByLocation(@RequestParam String location) {
        return tailorProfileService.searchByLocation(location);
    }

    @GetMapping("/search/specialization")
    public List<TailorProfileResponse> searchBySpecialization(@RequestParam String specialization) {
        return tailorProfileService.searchBySpecialization(specialization);
    }

    @PutMapping("/{id}")
    public TailorProfileResponse updateProfile(@PathVariable Long id, @RequestBody TailorProfileRequest request) {
        return tailorProfileService.updateProfile(id, request);
    }
}
