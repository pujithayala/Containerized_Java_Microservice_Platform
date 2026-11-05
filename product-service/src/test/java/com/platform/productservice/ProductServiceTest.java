package com.platform.productservice;

import com.platform.productservice.dto.ProductRequest;
import com.platform.productservice.dto.ProductResponse;
import com.platform.productservice.entity.Product;
import com.platform.productservice.exception.ProductNotFoundException;
import com.platform.productservice.repository.ProductRepository;
import com.platform.productservice.service.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product sampleProduct;
    private ProductRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("A test product description")
                .price(new BigDecimal("29.99"))
                .stockQuantity(100)
                .category("Electronics")
                .imageUrl("http://example.com/image.png")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        sampleRequest = ProductRequest.builder()
                .name("Test Product")
                .description("A test product description")
                .price(new BigDecimal("29.99"))
                .stockQuantity(100)
                .category("Electronics")
                .imageUrl("http://example.com/image.png")
                .build();
    }

    @Test
    void createProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(sampleRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Product");
        assertThat(response.getPrice()).isEqualByComparingTo(new BigDecimal("29.99"));
        assertThat(response.isActive()).isTrue();

        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void getProduct_NotFound_ThrowsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProduct(999L))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("999");

        verify(productRepository, times(1)).findById(999L);
    }

    @Test
    void deleteProduct_SoftDelete_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        productService.deleteProduct(1L);

        assertThat(sampleProduct.isActive()).isFalse();
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    void searchProducts_ReturnMatchingProducts() {
        Product product2 = Product.builder()
                .id(2L)
                .name("Another Test Item")
                .description("Another desc")
                .price(new BigDecimal("49.99"))
                .stockQuantity(50)
                .category("Books")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(productRepository.findByNameContainingIgnoreCase("test"))
                .thenReturn(List.of(sampleProduct, product2));

        List<ProductResponse> results = productService.searchProducts("test");

        assertThat(results).hasSize(2);
        assertThat(results).extracting(ProductResponse::getName)
                .containsExactlyInAnyOrder("Test Product", "Another Test Item");

        verify(productRepository, times(1)).findByNameContainingIgnoreCase("test");
    }
}

