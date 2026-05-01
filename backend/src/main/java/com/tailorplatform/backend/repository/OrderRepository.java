package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByTailorId(Long tailorId);
    java.util.Optional<Order> findByPaymentReference(String paymentReference);
}
