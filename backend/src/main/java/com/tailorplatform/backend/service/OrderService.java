package com.tailorplatform.backend.service;

import com.tailorplatform.backend.dto.OrderRequest;
import com.tailorplatform.backend.dto.OrderResponse;
import com.tailorplatform.backend.entity.Order;
import com.tailorplatform.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderResponse placeOrder(OrderRequest req) {
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

        return OrderResponse.from(orderRepository.save(order));
    }

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return OrderResponse.from(order);
    }

    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setOrderStatus(status);
        return OrderResponse.from(orderRepository.save(order));
    }

    public List<OrderResponse> getOrdersByTailor(Long tailorId) {
        return orderRepository.findByTailorId(tailorId).stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }
}
