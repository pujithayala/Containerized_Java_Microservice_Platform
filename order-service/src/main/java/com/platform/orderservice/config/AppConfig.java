package com.platform.orderservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Provides a shared RestTemplate bean used by service clients
     * to communicate with other microservices.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
