package com.platform.orderservice.client;

import com.platform.orderservice.dto.ProductDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class ProductServiceClient {

    private final RestTemplate restTemplate;
    private final String productServiceUrl;

    public ProductServiceClient(RestTemplate restTemplate,
                                @Value("${services.product-service.url}") String productServiceUrl) {
        this.restTemplate = restTemplate;
        this.productServiceUrl = productServiceUrl;
    }

    /**
     * Fetches product details from the Product Service.
     *
     * @param productId the product ID to retrieve
     * @return ProductDto if found, or null if the service is unavailable or product not found
     */
    public ProductDto getProduct(Long productId) {
        String url = productServiceUrl + "/api/products/" + productId;
        try {
            log.info("Fetching product with id {} from product-service at {}", productId, url);
            ProductDto product = restTemplate.getForObject(url, ProductDto.class);
            log.info("Successfully fetched product: {}", product);
            return product;
        } catch (RestClientException ex) {
            log.error("Failed to fetch product with id {} from product-service: {}", productId, ex.getMessage());
            return null;
        }
    }
}
