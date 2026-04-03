package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.TailorProfileRequest;
import com.tailorplatform.backend.entity.TailorProfile;
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
    public TailorProfile createProfile(@RequestBody TailorProfileRequest request) {
        return tailorProfileService.createProfile(request);
    }

    @GetMapping
    public List<TailorProfile> getAllProfiles() {
        return tailorProfileService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public TailorProfile getProfile(@PathVariable Long id) {
        return tailorProfileService.getProfile(id);
    }

    @GetMapping("/search/location")
    public List<TailorProfile> searchByLocation(@RequestParam String location) {
        return tailorProfileService.searchByLocation(location);
    }

    @GetMapping("/search/specialization")
    public List<TailorProfile> searchBySpecialization(@RequestParam String specialization) {
        return tailorProfileService.searchBySpecialization(specialization);
    }

    @PutMapping("/{id}")
    public TailorProfile updateProfile(@PathVariable Long id, @RequestBody TailorProfileRequest request) {
        return tailorProfileService.updateProfile(id, request);
    }
}
