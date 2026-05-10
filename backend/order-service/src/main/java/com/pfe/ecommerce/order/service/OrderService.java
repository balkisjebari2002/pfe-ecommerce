package com.pfe.ecommerce.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.ecommerce.order.client.ProductClient;
import com.pfe.ecommerce.order.dto.CreateOrderRequest;
import com.pfe.ecommerce.order.dto.OrderDto;
import com.pfe.ecommerce.order.dto.OrderItemDto;
import com.pfe.ecommerce.order.entity.Order;
import com.pfe.ecommerce.order.entity.OrderItem;
import com.pfe.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderDto placeOrder(String userId, CreateOrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            ProductClient.ProductInfo product = productClient.getProduct(itemReq.getProductId());
            if (product.stock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Stock insuffisant pour: " + product.name());
            }
            OrderItem item = OrderItem.builder()
                    .productId(product.id())
                    .productNameSnapshot(product.name())
                    .unitPriceSnapshot(product.price())
                    .quantity(itemReq.getQuantity())
                    .build();
            items.add(item);
            total = total.add(product.price().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        String addressJson;
        try {
            addressJson = objectMapper.writeValueAsString(request.getShippingAddress());
        } catch (JsonProcessingException e) {
            addressJson = "{}";
        }

        Order order = Order.builder()
                .userId(UUID.fromString(userId))
                .totalAmount(total)
                .currency("EUR")
                .shippingAddressJson(addressJson)
                .status(Order.OrderStatus.CONFIRMED)
                .build();

        Order saved = orderRepository.save(order);
        items.forEach(item -> {
            item.setOrder(saved);
            saved.getItems().add(item);
        });
        orderRepository.save(saved);

        return toDto(saved);
    }

    public List<OrderDto> getMyOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(UUID.fromString(userId))
                .stream().map(this::toDto).toList();
    }

    public OrderDto getOrderById(String userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Commande introuvable"));
        if (!order.getUserId().toString().equals(userId)) {
            throw new IllegalArgumentException("Accès refusé");
        }
        return toDto(order);
    }

    private OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setStatus(order.getStatus().name());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCurrency(order.getCurrency());
        dto.setCreatedAt(order.getCreatedAt());

        try {
            dto.setShippingAddress(objectMapper.readValue(order.getShippingAddressJson(), Object.class));
        } catch (Exception e) {
            dto.setShippingAddress(order.getShippingAddressJson());
        }

        dto.setItems(order.getItems().stream().map(item -> {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProductId());
            itemDto.setProductName(item.getProductNameSnapshot());
            itemDto.setUnitPrice(item.getUnitPriceSnapshot());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setSubtotal(item.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity())));
            return itemDto;
        }).toList());

        return dto;
    }
}
