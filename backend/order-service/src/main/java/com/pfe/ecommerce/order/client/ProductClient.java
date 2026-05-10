package com.pfe.ecommerce.order.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProductClient {

    private final WebClient productWebClient;

    @SuppressWarnings("unchecked")
    public ProductInfo getProduct(String productId) {
        Map<String, Object> response = productWebClient.get()
                .uri("/products/{id}", productId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            throw new IllegalArgumentException("Produit introuvable: " + productId);
        }

        String name = (String) response.get("name");
        Object priceObj = response.get("price");
        BigDecimal price = priceObj instanceof Number
                ? BigDecimal.valueOf(((Number) priceObj).doubleValue())
                : new BigDecimal(priceObj.toString());
        int stock = ((Number) response.getOrDefault("stock", 0)).intValue();

        return new ProductInfo(productId, name, price, stock);
    }

    public record ProductInfo(String id, String name, BigDecimal price, int stock) {}
}
