package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.DesignRequest;
import com.tailorplatform.backend.dto.DesignResponse;
import com.tailorplatform.backend.dto.PagedResponse;
import com.tailorplatform.backend.security.AuthenticatedUser;
import com.tailorplatform.backend.service.DesignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignService designService;

    /**
     * GET /api/designs — paginated catalog. All filters optional.
     *
     * @param keyword  free text across title/description/category
     * @param category exact category (case-insensitive)
     * @param tailorId only designs from this tailor
     * @param sortBy   "newest" (default) | "priceAsc" | "priceDesc"
     */
    @GetMapping
    public ResponseEntity<PagedResponse<DesignResponse>> searchDesigns(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long tailorId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(designService.searchDesigns(
                keyword, category, tailorId, minPrice, maxPrice, page, size, sortBy));
    }

    /** GET /api/designs/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<DesignResponse> getDesign(@PathVariable Long id) {
        return ResponseEntity.ok(designService.getDesign(id));
    }

    /** GET /api/designs/tailor/{tailorId} — every design a tailor offers (shop page / order form) */
    @GetMapping("/tailor/{tailorId}")
    public ResponseEntity<List<DesignResponse>> getDesignsByTailor(@PathVariable Long tailorId) {
        return ResponseEntity.ok(designService.getDesignsByTailor(tailorId));
    }

    /** POST /api/designs — TAILOR adds a design to their own shop */
    @PostMapping
    public ResponseEntity<DesignResponse> createDesign(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @Valid @RequestBody DesignRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(designService.createDesign(caller, req));
    }

    /** PUT /api/designs/{id} — owner (or ADMIN) edits a design */
    @PutMapping("/{id}")
    public ResponseEntity<DesignResponse> updateDesign(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @PathVariable Long id,
            @Valid @RequestBody DesignRequest req) {
        return ResponseEntity.ok(designService.updateDesign(caller, id, req));
    }

    /** DELETE /api/designs/{id} — owner (or ADMIN) removes a design */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDesign(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @PathVariable Long id) {
        designService.deleteDesign(caller, id);
        return ResponseEntity.noContent().build();
    }
}
