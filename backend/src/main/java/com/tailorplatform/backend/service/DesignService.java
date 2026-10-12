package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.DesignRequest;
import com.tailorplatform.backend.dto.DesignResponse;
import com.tailorplatform.backend.dto.PagedResponse;
import com.tailorplatform.backend.entity.Design;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.repository.DesignRepository;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import com.tailorplatform.backend.security.AuthenticatedUser;
import com.tailorplatform.backend.specification.DesignSearchSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignService {

    private static final int MAX_PAGE_SIZE = 50;

    private final DesignRepository        designRepository;
    private final TailorProfileRepository tailorProfileRepository;

    // ─── Browse ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<DesignResponse> searchDesigns(String keyword, String category, Long tailorId,
                                                       BigDecimal minPrice, BigDecimal maxPrice,
                                                       int page, int size, String sortBy) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalStateException("minPrice cannot be greater than maxPrice");
        }

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                resolveSort(sortBy));

        Page<Design> result = designRepository.findAll(
                DesignSearchSpecification.build(keyword, category, tailorId, minPrice, maxPrice), pageable);

        return PagedResponse.<DesignResponse>builder()
                .content(result.getContent().stream().map(DesignResponse::from).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public DesignResponse getDesign(Long id) {
        return DesignResponse.from(findDesign(id));
    }

    @Transactional(readOnly = true)
    public List<DesignResponse> getDesignsByTailor(Long tailorId) {
        return designRepository.findByTailorIdOrderByCreatedAtDesc(tailorId).stream()
                .map(DesignResponse::from)
                .toList();
    }

    // ─── Manage (tailor-owned) ───────────────────────────────────────────────

    @Transactional
    public DesignResponse createDesign(AuthenticatedUser caller, DesignRequest req) {
        TailorProfile tailor = tailorProfileRepository.findByUserId(caller.userId())
                .orElseThrow(() -> new IllegalStateException(
                        "Set up your shop profile before adding designs."));

        Design design = Design.builder().tailor(tailor).build();
        applyRequest(design, req);

        Design saved = designRepository.save(design);
        log.info("Design created — id={} tailorId={} title='{}'", saved.getId(), tailor.getId(), saved.getTitle());
        return DesignResponse.from(saved);
    }

    @Transactional
    public DesignResponse updateDesign(AuthenticatedUser caller, Long id, DesignRequest req) {
        Design design = findDesign(id);
        assertCanManage(caller, design);

        applyRequest(design, req);
        Design saved = designRepository.save(design);
        log.info("Design updated — id={} by userId={}", id, caller.userId());
        return DesignResponse.from(saved);
    }

    @Transactional
    public void deleteDesign(AuthenticatedUser caller, Long id) {
        Design design = findDesign(id);
        assertCanManage(caller, design);

        designRepository.delete(design);
        log.info("Design deleted — id={} by userId={}", id, caller.userId());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Used by OrderService to price an order from a catalog design. */
    @Transactional(readOnly = true)
    public Design findDesign(Long id) {
        return designRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Design not found: " + id));
    }

    private void assertCanManage(AuthenticatedUser caller, Design design) {
        if (caller.isAdmin()) return;
        Long ownerUserId = design.getTailor().getUser().getId();
        if (!ownerUserId.equals(caller.userId())) {
            throw new AccessDeniedException("You can only manage your own designs.");
        }
    }

    private static void applyRequest(Design design, DesignRequest req) {
        design.setTitle(req.getTitle().trim());
        design.setDescription(blankToNull(req.getDescription()));
        design.setPrice(req.getPrice());
        design.setCategory(req.getCategory().trim());
        design.setImageUrl(blankToNull(req.getImageUrl()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static Sort resolveSort(String sortBy) {
        if (sortBy == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sortBy) {
            case "priceAsc"  -> Sort.by(Sort.Direction.ASC,  "price");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            default          -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
