package com.pfe.ecommerce.order.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotEmpty
    private List<OrderItemRequest> items;

    @NotNull
    private ShippingAddressDto shippingAddress;

    @Data
    public static class OrderItemRequest {
        private String productId;
        private int quantity;
    }

    @Data
    public static class ShippingAddressDto {
        private String line1;
        private String line2;
        private String city;
        private String postalCode;
        private String country;
    }
}
