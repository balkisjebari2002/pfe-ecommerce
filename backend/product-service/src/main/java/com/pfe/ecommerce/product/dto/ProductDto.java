package com.pfe.ecommerce.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ProductDto {
    private String id;
    @NotBlank private String name;
    private String slug;
    private String description;
    @NotNull @DecimalMin("0.0") private BigDecimal price;
    private String currency = "EUR";
    @NotBlank private String category;
    private List<String> images;
    @Min(0) private int stock;
    private Map<String, Object> attributes;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
