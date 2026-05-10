package com.pfe.ecommerce.product.service;

import com.pfe.ecommerce.product.dto.ProductDto;
import com.pfe.ecommerce.product.entity.Product;
import com.pfe.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDto> listProducts(String category, String q, int page, int size, String sort) {
        Sort sortObj = "price_asc".equals(sort) ? Sort.by("price").ascending()
                : "price_desc".equals(sort) ? Sort.by("price").descending()
                : Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sortObj);

        boolean hasCategory = StringUtils.hasText(category);
        boolean hasQuery = StringUtils.hasText(q);

        Page<Product> products;
        if (hasCategory && hasQuery) {
            products = productRepository.searchByCategoryAndKeyword(category, q, pageable);
        } else if (hasCategory) {
            products = productRepository.findByCategoryAndActiveTrue(category, pageable);
        } else if (hasQuery) {
            products = productRepository.searchByKeyword(q, pageable);
        } else {
            products = productRepository.findByActiveTrue(pageable);
        }
        return products.map(this::toDto);
    }

    public ProductDto getById(String id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable: " + id));
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories()
                .stream()
                .map(Product::getCategory)
                .distinct()
                .sorted()
                .toList();
    }

    public ProductDto create(ProductDto dto) {
        Product product = toEntity(dto);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        if (!StringUtils.hasText(product.getSlug())) {
            product.setSlug(slugify(product.getName()));
        }
        return toDto(productRepository.save(product));
    }

    public ProductDto update(String id, ProductDto dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable: " + id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setCurrency(dto.getCurrency());
        existing.setCategory(dto.getCategory());
        existing.setImages(dto.getImages());
        existing.setStock(dto.getStock());
        existing.setAttributes(dto.getAttributes());
        existing.setActive(dto.isActive());
        existing.setUpdatedAt(LocalDateTime.now());
        return toDto(productRepository.save(existing));
    }

    public void delete(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setSlug(p.getSlug());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setCurrency(p.getCurrency() != null ? p.getCurrency() : "EUR");
        dto.setCategory(p.getCategory());
        dto.setImages(p.getImages());
        dto.setStock(p.getStock());
        dto.setAttributes(p.getAttributes());
        dto.setActive(p.isActive());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private Product toEntity(ProductDto dto) {
        return Product.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .currency(dto.getCurrency())
                .category(dto.getCategory())
                .images(dto.getImages())
                .stock(dto.getStock())
                .attributes(dto.getAttributes())
                .active(dto.isActive())
                .build();
    }

    private String slugify(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
