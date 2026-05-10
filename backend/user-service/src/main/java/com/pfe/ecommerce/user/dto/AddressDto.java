package com.pfe.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class AddressDto {
    private UUID id;
    @NotBlank private String line1;
    private String line2;
    @NotBlank private String city;
    @NotBlank private String postalCode;
    @NotBlank private String country;
    private boolean isDefault;
}
