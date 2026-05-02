package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.OrderRequest;
import com.tailorplatform.backend.dto.OrderResponse;
import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.entity.TailorProfile;
import com.tailorplatform.backend.repository.OrderRepository;
import com.tailorplatform.backend.repository.TailorProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final TailorProfileRepository tailorProfileRepository;

    // ─── Allowed status transitions (strict business flow) ───────────────────
    private static final Map<String, String> NEXT_STATUS = Map.of(
            "NEW",         "ACCEPTED",
            "ACCEPTED",    "IN_PROGRESS",
            "IN_PROGRESS", "READY",
            "READY",       "DELIVERED"
    );

    // ─── Place order ─────────────────────────────────────────────────────────

    public OrderResponse placeOrder(OrderRequest req) {
        // Validated by @Valid in controller; these are extra safety guards
        if (req.getTailorId() == null) {
            throw new IllegalArgumentException("tailorId is required");
        }
        if (req.getMeasurementId() == null) {
            throw new IllegalArgumentException("measurementId is required — save measurements first");
        }

        // Confirm the tailor profile exists in the database
        TailorProfile tailor = tailorProfileRepository.findById(req.getTailorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tailor not found: " + req.getTailorId()));

        Order order = Order.builder()
                .userId(req.getUserId())
                .tailorId(req.getTailorId())
                .measurementId(req.getMeasurementId())
                .styleChoice(req.getStyleChoice())
                .fabricChoice(req.getFabricChoice())
                .amount(req.getAmount())
                .paymentStatus("PENDING")
                .orderStatus("NEW")
                .deliveryDate(req.getDeliveryDate())
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created — id={} userId={} tailorId={}", saved.getId(), saved.getUserId(), saved.getTailorId());
        return OrderResponse.from(saved, tailor);
    }

    // ─── Get orders ──────────────────────────────────────────────────────────

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(order -> OrderResponse.from(order, resolveTailor(order.getTailorId())))
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return OrderResponse.from(order, resolveTailor(order.getTailorId()));
    }

    public List<OrderResponse> getOrdersByTailor(Long tailorId) {
        return orderRepository.findByTailorId(tailorId).stream()
                .map(order -> OrderResponse.from(order, resolveTailor(order.getTailorId())))
                .collect(Collectors.toList());
    }

    // ─── Update order status (state machine) ─────────────────────────────────

    public OrderResponse updateOrderStatus(Long orderId, String requestedStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        String currentStatus = order.getOrderStatus();
        String allowedNext   = NEXT_STATUS.get(currentStatus);

        if (allowedNext == null) {
            throw new IllegalStateException(
                    "Order is already in a terminal state: " + currentStatus);
        }
        if (!allowedNext.equalsIgnoreCase(requestedStatus)) {
            throw new IllegalStateException(
                    "Invalid transition: " + currentStatus + " → " + requestedStatus
                    + ". Expected next status: " + allowedNext);
        }

        order.setOrderStatus(requestedStatus.toUpperCase());
        Order saved = orderRepository.save(order);
        log.info("Order {} status: {} → {}", orderId, currentStatus, requestedStatus);
        return OrderResponse.from(saved, resolveTailor(saved.getTailorId()));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    /** Null-safe tailor lookup — returns null if not found (UI shows "Unknown tailor") */
    private TailorProfile resolveTailor(Long tailorId) {
        if (tailorId == null) return null;
        return tailorProfileRepository.findById(tailorId).orElse(null);
    }
}
