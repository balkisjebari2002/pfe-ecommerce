package com.pfe.ecommerce.order.controller;

import com.pfe.ecommerce.order.dto.CreateOrderRequest;
import com.pfe.ecommerce.order.dto.OrderDto;
import com.pfe.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> placeOrder(Authentication auth,
                                               @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(auth.getName(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getMyOrders(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrder(Authentication auth, @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(auth.getName(), id));
    }
}
