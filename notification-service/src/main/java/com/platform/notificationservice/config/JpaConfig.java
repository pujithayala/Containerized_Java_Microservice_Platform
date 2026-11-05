package com.platform.notificationservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.platform.notificationservice.repository")
public class JpaConfig {
    // JPA Auditing is enabled here to populate @CreatedDate fields automatically.
}
