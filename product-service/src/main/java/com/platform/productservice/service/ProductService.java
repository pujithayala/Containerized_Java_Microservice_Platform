package com.platform.productservice.service;

import com.platform.productservice.dto.ProductRequest;
import com.platform.productservice.dto.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse getProduct(Long id);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getActiveProducts();

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    List<ProductResponse> searchProducts(String name);

    List<ProductResponse> getByCategory(String category);

    long getTotalCount();
}

