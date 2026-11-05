package com.platform.orderservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class NotificationServiceClient {

    private final RestTemplate restTemplate;
    private final String notificationServiceUrl;

    public NotificationServiceClient(RestTemplate restTemplate,
                                     @Value("${services.notification-service.url}") String notificationServiceUrl) {
        this.restTemplate = restTemplate;
        this.notificationServiceUrl = notificationServiceUrl;
    }

    /**
     * Sends an order-related notification to the Notification Service.
     * Failures are silently caught to prevent order operations from failing.
     *
     * @param orderId  the order ID
     * @param userId   the user ID who placed the order
     * @param event    the event type (e.g., "ORDER_CREATED", "ORDER_UPDATED")
     * @param message  human-readable notification message
     */
    public void sendOrderNotification(Long orderId, Long userId, String event, String message) {
        String url = notificationServiceUrl + "/api/notifications";
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", orderId);
            payload.put("userId", userId);
            payload.put("type", event);
            payload.put("title", "Order " + event);
            payload.put("message", message);

            log.info("Sending notification for orderId={}, event={}", orderId, event);
            restTemplate.postForObject(url, payload, Map.class);
            log.info("Notification sent successfully for orderId={}", orderId);
        } catch (Exception ex) {
            // Notification failure must never fail order operations
            log.warn("Notification service unavailable or failed for orderId={}: {}", orderId, ex.getMessage());
        }
    }
}
