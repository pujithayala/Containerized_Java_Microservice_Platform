package com.platform.orderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA configuration that enables auditing support.
 * This allows @CreatedDate and @LastModifiedDate annotations
 * to be automatically populated on entity lifecycle events.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
