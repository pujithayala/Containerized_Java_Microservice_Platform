package com.platform.orderservice;

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
import com.platform.orderservice.service.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductServiceClient productServiceClient;

    @Mock
    private NotificationServiceClient notificationServiceClient;

    @InjectMocks
    private OrderServiceImpl orderService;

    private ProductDto sampleProduct;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleProduct = ProductDto.builder()
                .id(10L)
                .name("Widget Pro")
                .price(new BigDecimal("49.99"))
                .stockQuantity(100)
                .build();

        sampleOrder = Order.builder()
                .id(1L)
                .userId(5L)
                .productId(10L)
                .productName("Widget Pro")
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .totalPrice(new BigDecimal("99.98"))
                .status(OrderStatus.PENDING)
                .shippingAddress("123 Main St")
                .notes("Leave at door")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // -------------------------------------------------------------------------
    // createOrder tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createOrder - success: product available and stock sufficient")
    void createOrder_success() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .userId(5L)
                .productId(10L)
                .quantity(2)
                .shippingAddress("123 Main St")
                .notes("Leave at door")
                .build();

        when(productServiceClient.getProduct(10L)).thenReturn(sampleProduct);
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);
        doNothing().when(notificationServiceClient)
                .sendOrderNotification(anyLong(), anyLong(), anyString(), anyString());

        OrderResponse response = orderService.createOrder(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(5L);
        assertThat(response.getProductId()).isEqualTo(10L);
        assertThat(response.getProductName()).isEqualTo("Widget Pro");
        assertThat(response.getQuantity()).isEqualTo(2);
        assertThat(response.getUnitPrice()).isEqualByComparingTo("49.99");
        assertThat(response.getTotalPrice()).isEqualByComparingTo("99.98");
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);

        verify(orderRepository, times(1)).save(any(Order.class));
        verify(notificationServiceClient, times(1))
                .sendOrderNotification(anyLong(), anyLong(), eq("ORDER_CREATED"), anyString());
    }

    @Test
    @DisplayName("createOrder - throws InsufficientStockException when stock is too low")
    void createOrder_insufficientStock() {
        sampleProduct.setStockQuantity(1); // Only 1 in stock
        CreateOrderRequest request = CreateOrderRequest.builder()
                .userId(5L)
                .productId(10L)
                .quantity(5)
                .build();

        when(productServiceClient.getProduct(10L)).thenReturn(sampleProduct);

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("createOrder - proceeds with ZERO price when product service is unavailable")
    void createOrder_productServiceUnavailable() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .userId(5L)
                .productId(10L)
                .quantity(2)
                .build();

        Order fallbackOrder = Order.builder()
                .id(2L)
                .userId(5L)
                .productId(10L)
                .productName("Unknown Product")
                .quantity(2)
                .unitPrice(BigDecimal.ZERO)
                .totalPrice(BigDecimal.ZERO)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(productServiceClient.getProduct(10L)).thenReturn(null);
        when(orderRepository.save(any(Order.class))).thenReturn(fallbackOrder);

        OrderResponse response = orderService.createOrder(request);

        assertThat(response.getProductName()).isEqualTo("Unknown Product");
        assertThat(response.getUnitPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(orderRepository).save(any(Order.class));
    }

    // -------------------------------------------------------------------------
    // getOrder tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getOrder - returns order when found")
    void getOrder_found() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        OrderResponse response = orderService.getOrder(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);
    }

    @Test
    @DisplayName("getOrder - throws OrderNotFoundException when not found")
    void getOrder_notFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder(99L))
                .isInstanceOf(OrderNotFoundException.class)
                .hasMessageContaining("99");
    }

    // -------------------------------------------------------------------------
    // getOrdersByUser tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getOrdersByUser - returns list of orders for user")
    void getOrdersByUser_success() {
        when(orderRepository.findByUserId(5L)).thenReturn(List.of(sampleOrder));

        List<OrderResponse> results = orderService.getOrdersByUser(5L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getUserId()).isEqualTo(5L);
    }

    @Test
    @DisplayName("getOrdersByUser - returns empty list when user has no orders")
    void getOrdersByUser_empty() {
        when(orderRepository.findByUserId(999L)).thenReturn(List.of());

        List<OrderResponse> results = orderService.getOrdersByUser(999L);

        assertThat(results).isEmpty();
    }

    // -------------------------------------------------------------------------
    // getAllOrders tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getAllOrders - returns all orders")
    void getAllOrders_success() {
        when(orderRepository.findAll()).thenReturn(List.of(sampleOrder));

        List<OrderResponse> results = orderService.getAllOrders();

        assertThat(results).hasSize(1);
    }

    // -------------------------------------------------------------------------
    // updateOrderStatus tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("updateOrderStatus - successfully transitions PENDING to CONFIRMED")
    void updateOrderStatus_success() {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(OrderStatus.CONFIRMED);

        Order updatedOrder = Order.builder()
                .id(1L)
                .userId(5L)
                .productId(10L)
                .productName("Widget Pro")
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .totalPrice(new BigDecimal("99.98"))
                .status(OrderStatus.CONFIRMED)
                .shippingAddress("123 Main St")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(updatedOrder);

        OrderResponse response = orderService.updateOrderStatus(1L, request);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(notificationServiceClient).sendOrderNotification(
                anyLong(), anyLong(), eq("ORDER_STATUS_UPDATED"), anyString());
    }

    @Test
    @DisplayName("updateOrderStatus - throws IllegalArgumentException when order is CANCELLED")
    void updateOrderStatus_cancelledOrder() {
        sampleOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(OrderStatus.CONFIRMED);

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cancelled");
    }

    // -------------------------------------------------------------------------
    // cancelOrder tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("cancelOrder - successfully cancels a PENDING order")
    void cancelOrder_success() {
        Order cancelledOrder = Order.builder()
                .id(1L)
                .userId(5L)
                .productId(10L)
                .productName("Widget Pro")
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .totalPrice(new BigDecimal("99.98"))
                .status(OrderStatus.CANCELLED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(cancelledOrder);

        OrderResponse response = orderService.cancelOrder(1L);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(notificationServiceClient).sendOrderNotification(
                anyLong(), anyLong(), eq("ORDER_CANCELLED"), anyString());
    }

    @Test
    @DisplayName("cancelOrder - throws IllegalArgumentException when already CANCELLED")
    void cancelOrder_alreadyCancelled() {
        sampleOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    @DisplayName("cancelOrder - throws IllegalArgumentException when order is DELIVERED")
    void cancelOrder_deliveredOrder() {
        sampleOrder.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot cancel a delivered order");
    }

    // -------------------------------------------------------------------------
    // getTotalCount tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getTotalCount - returns repository count")
    void getTotalCount_success() {
        when(orderRepository.count()).thenReturn(42L);

        long count = orderService.getTotalCount();

        assertThat(count).isEqualTo(42L);
    }
}
