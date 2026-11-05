package com.platform.productservice.controller;

import com.platform.productservice.dto.ProductRequest;
import com.platform.productservice.dto.ProductResponse;
import com.platform.productservice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        log.info("POST /api/products - Creating product");
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        log.info("GET /api/products/{}", id);
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<ProductResponse> products;

        if (search != null && !search.isBlank()) {
            log.info("GET /api/products?search={}", search);
            products = productService.searchProducts(search);
        } else if (category != null && !category.isBlank()) {
            log.info("GET /api/products?category={}", category);
            products = productService.getByCategory(category);
        } else {
            log.info("GET /api/products - Listing all");
            products = productService.getAllProducts();
        }

        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        log.info("PUT /api/products/{}", id);
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        log.info("DELETE /api/products/{} (soft delete)", id);
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deactivated successfully"));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount() {
        log.info("GET /api/products/count");
        long count = productService.getTotalCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductResponse>> getActiveProducts() {
        log.info("GET /api/products/active");
        List<ProductResponse> products = productService.getActiveProducts();
        return ResponseEntity.ok(products);
    }
}

