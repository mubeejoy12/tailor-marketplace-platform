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

    private final OrderRepository         orderRepository;
    private final TailorProfileRepository tailorProfileRepository;
    private final NotificationService     notificationService;

    // ─── Allowed status transitions (strict business flow) ───────────────────
    private static final Map<String, String> NEXT_STATUS = Map.of(
            "NEW",         "ACCEPTED",
            "ACCEPTED",    "IN_PROGRESS",
            "IN_PROGRESS", "READY",
            "READY",       "DELIVERED"
    );

    // ─── Place order ─────────────────────────────────────────────────────────

    public OrderResponse placeOrder(OrderRequest req) {
        if (req.getTailorId() == null) {
            throw new IllegalArgumentException("tailorId is required");
        }

        TailorProfile tailor = tailorProfileRepository.findById(req.getTailorId())
                .orElseThrow(() -> new IllegalArgumentException("Tailor not found: " + req.getTailorId()));

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

        // Notify the tailor about the new order
        Long tailorUserId = tailor.getUser() != null ? tailor.getUser().getId() : null;
        notificationService.send(tailorUserId,
                "New order #" + saved.getId() + " placed for " + saved.getStyleChoice() + ".");
        // Notify the customer about order confirmation
        notificationService.send(saved.getUserId(),
                "Your order #" + saved.getId() + " has been placed successfully. Awaiting tailor acceptance.");

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

    // ─── Update order status (state machine + notifications) ─────────────────

    public OrderResponse updateOrderStatus(Long orderId, String requestedStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        String currentStatus = order.getOrderStatus();
        String allowedNext   = NEXT_STATUS.get(currentStatus);

        if (allowedNext == null) {
            throw new IllegalStateException("Order is already in a terminal state: " + currentStatus);
        }
        if (!allowedNext.equalsIgnoreCase(requestedStatus)) {
            throw new IllegalStateException(
                    "Invalid transition: " + currentStatus + " → " + requestedStatus
                    + ". Expected next status: " + allowedNext);
        }

        order.setOrderStatus(requestedStatus.toUpperCase());
        Order saved = orderRepository.save(order);
        log.info("Order {} status: {} → {}", orderId, currentStatus, requestedStatus);

        // Fire status-specific notification to the customer
        String upper = requestedStatus.toUpperCase();
        switch (upper) {
            case "ACCEPTED"    -> notificationService.send(saved.getUserId(),
                    "Good news! Your order #" + orderId + " has been accepted by your tailor.");
            case "IN_PROGRESS" -> notificationService.send(saved.getUserId(),
                    "Your order #" + orderId + " is now being worked on.");
            case "READY"       -> notificationService.send(saved.getUserId(),
                    "Your order #" + orderId + " is ready for pickup/delivery!");
            case "DELIVERED"   -> notificationService.send(saved.getUserId(),
                    "Your order #" + orderId + " has been delivered. Please leave a review!");
        }

        return OrderResponse.from(saved, resolveTailor(saved.getTailorId()));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private TailorProfile resolveTailor(Long tailorId) {
        if (tailorId == null) return null;
        return tailorProfileRepository.findById(tailorId).orElse(null);
    }
}
