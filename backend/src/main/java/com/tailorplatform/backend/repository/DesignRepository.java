package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.Design;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignRepository extends JpaRepository<Design, Long>, JpaSpecificationExecutor<Design> {

    /** Catalog search — fetches the owning tailor in the same query to avoid N+1 lookups. */
    @Override
    @EntityGraph(attributePaths = "tailor")
    Page<Design> findAll(Specification<Design> spec, Pageable pageable);

    @EntityGraph(attributePaths = "tailor")
    List<Design> findByTailorIdOrderByCreatedAtDesc(Long tailorId);
}
