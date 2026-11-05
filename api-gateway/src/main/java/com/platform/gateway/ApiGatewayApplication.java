package com.platform.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway Service - Central entry point for the microservice platform.
 * Routes incoming HTTP requests to the appropriate downstream microservice
 * using Spring Cloud Gateway (reactive/WebFlux-based).
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
