package com.platform.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test that verifies the Spring application context loads successfully.
 * Uses a random port to avoid conflicts when running in CI alongside other services.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ApiGatewayApplicationTest {

    /**
     * Context-load test: if the application context fails to start (e.g. missing
     * beans, misconfigured routes, or property binding errors), this test fails
     * immediately with a descriptive error from Spring.
     */
    @Test
    void contextLoads() {
        // No assertions needed – the test passes if the context starts without error.
    }
}
