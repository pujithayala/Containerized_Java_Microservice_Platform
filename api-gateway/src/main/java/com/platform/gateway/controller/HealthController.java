package com.platform.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * HealthController exposes lightweight diagnostic endpoints for the API Gateway.
 *
 * <ul>
 *   <li>GET /health  – returns service status and timestamp</li>
 *   <li>GET /services – returns registered downstream service names and their base URLs</li>
 * </ul>
 *
 * <p>These endpoints are <em>in addition to</em> the Spring Boot Actuator endpoints
 * exposed at {@code /actuator/health} and {@code /actuator/gateway}.</p>
 *
 * <p>Because Spring Cloud Gateway is WebFlux-based, all controller methods return
 * reactive types ({@link Mono}).</p>
 */
@RestController
public class HealthController {

    @Value("${services.urls.user-service:http://user-service:8081}")
    private String userServiceUrl;

    @Value("${services.urls.product-service:http://product-service:8082}")
    private String productServiceUrl;

    @Value("${services.urls.order-service:http://order-service:8083}")
    private String orderServiceUrl;

    @Value("${services.urls.notification-service:http://notification-service:8085}")
    private String notificationServiceUrl;

    /**
     * Returns a simple health status payload indicating the gateway is alive.
     *
     * @return {@code {"status":"UP","service":"api-gateway","timestamp":"<ISO-8601>"}}
     */
    @GetMapping("/health")
    public Mono<Map<String, String>> health() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "api-gateway");
        response.put("timestamp", Instant.now().toString());
        return Mono.just(response);
    }

    /**
     * Returns the list of registered downstream services and their configured base URLs.
     *
     * @return a list of service-descriptor maps, each containing {@code name} and {@code url}
     */
    @GetMapping("/services")
    public Mono<List<Map<String, String>>> services() {
        List<Map<String, String>> serviceList = List.of(
                serviceEntry("user-service",         userServiceUrl),
                serviceEntry("product-service",      productServiceUrl),
                serviceEntry("order-service",        orderServiceUrl),
                serviceEntry("notification-service", notificationServiceUrl)
        );
        return Mono.just(serviceList);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Map<String, String> serviceEntry(String name, String url) {
        Map<String, String> entry = new LinkedHashMap<>();
        entry.put("name", name);
        entry.put("url", url);
        return entry;
    }
}
