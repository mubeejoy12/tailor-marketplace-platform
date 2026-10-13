package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SiteContentController {

    private final SiteContentService siteContentService;

    /** GET /api/site-content — public; the homepage reads its pictures and text from here */
    @GetMapping("/api/site-content")
    public ResponseEntity<Map<String, String>> getSiteContent() {
        return ResponseEntity.ok(siteContentService.getAll());
    }

    /** PUT /api/admin/site-content — ADMIN; body is { key: value }, blank value resets a key */
    @PutMapping("/api/admin/site-content")
    public ResponseEntity<Map<String, String>> updateSiteContent(@RequestBody Map<String, String> changes) {
        return ResponseEntity.ok(siteContentService.update(changes));
    }
}
