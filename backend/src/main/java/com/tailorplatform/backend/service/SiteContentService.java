package com.tailorplatform.backend.service;

import com.tailorplatform.backend.entity.SiteContent;
import com.tailorplatform.backend.repository.SiteContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

/**
 * Admin-managed homepage content: hero, promo banner and category pictures.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SiteContentService {

    private static final int MAX_VALUE_LENGTH = 2000;

    /** Only these keys may be stored — keeps the table from becoming a free-for-all. */
    private static final Pattern ALLOWED_KEY = Pattern.compile(
            "^(hero\\.(imageUrl|title|subtitle)"
            + "|banner\\.(imageUrl|title|text|link)"
            + "|category\\.[A-Za-z&' ]{1,40}\\.imageUrl)$");

    private final SiteContentRepository siteContentRepository;

    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        Map<String, String> content = new TreeMap<>();
        siteContentRepository.findAll().forEach(c -> content.put(c.getContentKey(), c.getContentValue()));
        return content;
    }

    /**
     * Upserts the given keys. A blank value removes the key, so the site falls back to its default.
     * Validates every entry before writing any of them.
     */
    @Transactional
    public Map<String, String> update(Map<String, String> changes) {
        changes.forEach(SiteContentService::validate);

        changes.forEach((key, rawValue) -> {
            String value = rawValue == null ? "" : rawValue.trim();
            var existing = siteContentRepository.findByContentKey(key);
            if (value.isEmpty()) {
                existing.ifPresent(siteContentRepository::delete);
            } else {
                SiteContent row = existing.orElseGet(() -> SiteContent.builder().contentKey(key).build());
                row.setContentValue(value);
                siteContentRepository.save(row);
            }
        });

        log.info("Site content updated — keys={}", changes.keySet());
        return getAll();
    }

    private static void validate(String key, String rawValue) {
        if (key == null || !ALLOWED_KEY.matcher(key).matches()) {
            throw new IllegalStateException("Unknown site content key: " + key);
        }
        String value = rawValue == null ? "" : rawValue.trim();
        if (value.length() > MAX_VALUE_LENGTH) {
            throw new IllegalStateException("Value for " + key + " is too long.");
        }
        if (value.isEmpty()) return;

        // URLs end up in <img src> / <a href>: only allow web links and site-relative paths
        boolean isUrlField = key.endsWith("imageUrl") || key.equals("banner.link");
        if (isUrlField && !(value.startsWith("https://") || value.startsWith("http://")
                || (key.equals("banner.link") && value.startsWith("/") && !value.startsWith("//")))) {
            throw new IllegalStateException(key + " must be a web link (https://…)"
                    + (key.equals("banner.link") ? " or a site path like /designs" : "") + ".");
        }
    }
}
