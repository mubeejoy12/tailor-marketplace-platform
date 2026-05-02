package com.tailorplatform.backend.controller;

import com.tailorplatform.backend.dto.OrderRequest;
import com.tailorplatform.backend.dto.OrderResponse;
import com.tailorplatform.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** POST /api/orders — place a new order. @Valid triggers bean validation on OrderRequest. */
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(req));
    }

    /** GET /api/orders/{userId} — all orders for a customer */
    @GetMapping("/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    /** GET /api/orders/details/{orderId} — full order details with tailor info */
    @GetMapping("/details/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    /** PUT /api/orders/{orderId}/status — advance order status (strict state machine) */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    /** GET /api/orders/tailor/{tailorId} — all orders assigned to a tailor */
    @GetMapping("/tailor/{tailorId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByTailor(@PathVariable Long tailorId) {
        return ResponseEntity.ok(orderService.getOrdersByTailor(tailorId));
    }
}
