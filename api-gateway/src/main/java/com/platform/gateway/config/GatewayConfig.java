package com.platform.gateway.config;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * GatewayConfig registers global filters and any programmatic route configuration
 * for the Spring Cloud Gateway. YAML-based routes are picked up automatically
 * from application.yml; this class adds cross-cutting concerns via GlobalFilter beans.
 */
@Configuration
public class GatewayConfig {

    private static final Logger log = LoggerFactory.getLogger(GatewayConfig.class);

    /**
     * Registers the custom logging filter as a Spring-managed GlobalFilter bean.
     * This complements the {@link LoggingFilter} component registration and allows
     * additional programmatic wiring if required in the future.
     *
     * @return a GlobalFilter that logs method, path, and wall-clock timestamp
     */
    @Bean
    public GlobalFilter requestLoggingGlobalFilter() {
        return (exchange, chain) -> {
            String method = exchange.getRequest().getMethod().name();
            String path   = exchange.getRequest().getURI().getPath();
            String ts     = Instant.now().toString();

            log.info("[API-GATEWAY] Incoming request  | method={} path={} timestamp={}", method, path, ts);

            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                int statusCode = exchange.getResponse().getStatusCode() != null
                        ? exchange.getResponse().getStatusCode().value()
                        : -1;
                log.info("[API-GATEWAY] Completed request | method={} path={} status={} timestamp={}",
                        method, path, statusCode, Instant.now().toString());
            }));
        };
    }
}
