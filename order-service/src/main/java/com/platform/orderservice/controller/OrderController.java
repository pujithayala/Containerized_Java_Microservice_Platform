package com.platform.orderservice.controller;

import com.platform.orderservice.dto.CreateOrderRequest;
import com.platform.orderservice.dto.OrderResponse;
import com.platform.orderservice.dto.UpdateOrderStatusRequest;
import com.platform.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders
     * Creates a new order.
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        log.info("POST /api/orders - creating order for userId={}", request.getUserId());
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/orders/{id}
     * Retrieves a single order by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        log.info("GET /api/orders/{}", id);
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    /**
     * GET /api/orders
     * Retrieves all orders.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        log.info("GET /api/orders - fetching all orders");
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * GET /api/orders/user/{userId}
     * Retrieves all orders placed by a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(@PathVariable Long userId) {
        log.info("GET /api/orders/user/{}", userId);
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    /**
     * PUT /api/orders/{id}/status
     * Updates the status of an existing order.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {
        log.info("PUT /api/orders/{}/status - new status={}", id, request.getStatus());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    /**
     * DELETE /api/orders/{id}
     * Cancels an order.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        log.info("DELETE /api/orders/{} - cancelling order", id);
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    /**
     * GET /api/orders/count
     * Returns the total number of orders.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount() {
        long count = orderService.getTotalCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
