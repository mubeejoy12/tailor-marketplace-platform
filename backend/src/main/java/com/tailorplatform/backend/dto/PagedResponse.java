package com.tailorplatform.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Generic paginated wrapper returned by list endpoints.
 */
@Data
@Builder
public class PagedResponse<T> {

    private List<T> content;
    private int     page;          // 0-based current page
    private int     size;          // page size requested
    private long    totalElements; // total matching records
    private int     totalPages;
    private boolean first;
    private boolean last;
}
