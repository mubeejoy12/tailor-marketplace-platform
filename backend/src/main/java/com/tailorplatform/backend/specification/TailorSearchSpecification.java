package com.tailorplatform.backend.specification;

import com.tailorplatform.backend.entity.TailorProfile;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Composable JPA Specification for dynamic tailor search/filtering.
 *
 * <p>All filter criteria are optional.  Pass {@code null} to skip a filter.
 *
 * <pre>
 * Usage:
 *   Specification&lt;TailorProfile&gt; spec = TailorSearchSpecification.build(
 *       keyword, location, specialization, minRating, verifiedOnly);
 *   Page&lt;TailorProfile&gt; page = tailorProfileRepository.findAll(spec, pageable);
 * </pre>
 */
public class TailorSearchSpecification implements Specification<TailorProfile> {

    private final String     keyword;
    private final String     location;
    private final String     specialization;
    private final BigDecimal minRating;
    private final boolean    verifiedOnly;

    private TailorSearchSpecification(
            String keyword, String location, String specialization,
            BigDecimal minRating, boolean verifiedOnly) {
        this.keyword        = keyword;
        this.location       = location;
        this.specialization = specialization;
        this.minRating      = minRating;
        this.verifiedOnly   = verifiedOnly;
    }

    /** Factory method — all parameters are nullable / optional. */
    public static Specification<TailorProfile> build(
            String keyword,
            String location,
            String specialization,
            BigDecimal minRating,
            boolean verifiedOnly) {
        return new TailorSearchSpecification(keyword, location, specialization, minRating, verifiedOnly);
    }

    @Override
    public Predicate toPredicate(Root<TailorProfile> root,
                                 CriteriaQuery<?> query,
                                 CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        // ── Keyword: searches shopName + specialization + location ────────────
        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("shopName")),       like),
                    cb.like(cb.lower(root.get("specialization")), like),
                    cb.like(cb.lower(root.get("location")),       like)
            ));
        }

        // ── Location filter ───────────────────────────────────────────────────
        if (location != null && !location.isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"));
        }

        // ── Specialization filter ─────────────────────────────────────────────
        if (specialization != null && !specialization.isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("specialization")),
                    "%" + specialization.toLowerCase() + "%"));
        }

        // ── Minimum rating ────────────────────────────────────────────────────
        if (minRating != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
        }

        // ── Verified only ─────────────────────────────────────────────────────
        if (verifiedOnly) {
            predicates.add(cb.equal(root.get("verificationStatus"), "APPROVED"));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }
}
