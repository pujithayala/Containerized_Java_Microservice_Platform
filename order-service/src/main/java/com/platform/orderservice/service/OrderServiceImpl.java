package com.platform.orderservice.service;

import com.platform.orderservice.client.NotificationServiceClient;
import com.platform.orderservice.client.ProductServiceClient;
import com.platform.orderservice.dto.CreateOrderRequest;
import com.platform.orderservice.dto.OrderResponse;
import com.platform.orderservice.dto.ProductDto;
import com.platform.orderservice.dto.UpdateOrderStatusRequest;
import com.platform.orderservice.entity.Order;
import com.platform.orderservice.entity.OrderStatus;
import com.platform.orderservice.exception.InsufficientStockException;
import com.platform.orderservice.exception.OrderNotFoundException;
import com.platform.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for userId={}, productId={}", request.getUserId(), request.getProductId());

        // Fetch product details from Product Service
        ProductDto product = productServiceClient.getProduct(request.getProductId());

        BigDecimal unitPrice;
        String productName;

        if (product == null) {
            log.warn("Product service unavailable or product {} not found; proceeding with unknown product", request.getProductId());
            unitPrice = BigDecimal.ZERO;
            productName = "Unknown Product";
        } else {
            // Validate stock availability
            if (product.getStockQuantity() != null && product.getStockQuantity() < request.getQuantity()) {
                throw new InsufficientStockException(request.getProductId(), request.getQuantity(), product.getStockQuantity());
            }
            unitPrice = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            productName = product.getName();
        }

        // Calculate total price
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = Order.builder()
                .userId(request.getUserId())
                .productId(request.getProductId())
                .productName(productName)
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .notes(request.getNotes())
                .build();

        Order saved = orderRepository.save(order);
        log.info("Order created with id={}", saved.getId());

        // Send notification (fire-and-forget, failure is silently swallowed)
        notificationServiceClient.sendOrderNotification(
                saved.getId(),
                saved.getUserId(),
                "ORDER_CREATED",
                String.format("Your order #%d for '%s' (qty: %d) has been placed successfully.",
                        saved.getId(), saved.getProductName(), saved.getQuantity())
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        log.info("Updating order id={} to status={}", id, request.getStatus());

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot update status of a cancelled order.");
        }
        if (order.getStatus() == OrderStatus.DELIVERED && request.getStatus() != OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Delivered orders can only be transitioned to CANCELLED.");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(request.getStatus());
        Order updated = orderRepository.save(order);

        notificationServiceClient.sendOrderNotification(
                updated.getId(),
                updated.getUserId(),
                "ORDER_STATUS_UPDATED",
                String.format("Your order #%d status has changed from %s to %s.",
                        updated.getId(), previousStatus, updated.getStatus())
        );

        return toResponse(updated);
    }

    @Override
    public OrderResponse cancelOrder(Long id) {
        log.info("Cancelling order id={}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order is already cancelled.");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel a delivered order.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order cancelled = orderRepository.save(order);

        notificationServiceClient.sendOrderNotification(
                cancelled.getId(),
                cancelled.getUserId(),
                "ORDER_CANCELLED",
                String.format("Your order #%d has been cancelled.", cancelled.getId())
        );

        return toResponse(cancelled);
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalCount() {
        return orderRepository.count();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .productId(order.getProductId())
                .productName(order.getProductName())
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
