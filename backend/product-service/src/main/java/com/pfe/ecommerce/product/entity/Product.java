package com.pfe.ecommerce.product.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    private String id;

    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String currency;
    private String category;
    private List<String> images;
    private int stock;
    private Map<String, Object> attributes;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
