package com.platform.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * LoggingFilter is a GlobalFilter that runs for every request passing through
 * the API Gateway. It logs the HTTP method, full URI, and wall-clock timestamp
 * before delegating to the next filter in the chain, and logs the response
 * status code after the downstream call completes.
 *
 * <p>Order {@code Ordered.HIGHEST_PRECEDENCE} ensures this filter executes
 * before all other filters, capturing the original request details.</p>
 */
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        String method    = request.getMethod().name();
        String uri       = request.getURI().toString();
        String timestamp = Instant.now().toString();

        log.info("[LoggingFilter] >>> Request  | method={} uri={} timestamp={}", method, uri, timestamp);

        long startMs = System.currentTimeMillis();

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long elapsedMs = System.currentTimeMillis() - startMs;
            int statusCode = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value()
                    : -1;
            log.info("[LoggingFilter] <<< Response | method={} uri={} status={} duration={}ms timestamp={}",
                    method, uri, statusCode, elapsedMs, Instant.now().toString());
        }));
    }

    /**
     * Run this filter at the very highest precedence so it wraps all other filters.
     */
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
