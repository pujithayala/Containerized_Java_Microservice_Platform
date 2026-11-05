package com.platform.orderservice.service;

import com.platform.orderservice.dto.CreateOrderRequest;
import com.platform.orderservice.dto.OrderResponse;
import com.platform.orderservice.dto.UpdateOrderStatusRequest;
import com.platform.orderservice.entity.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrder(Long id);

    List<OrderResponse> getOrdersByUser(Long userId);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(Long id);

    long getTotalCount();
}
