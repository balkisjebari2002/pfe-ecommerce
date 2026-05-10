package com.pfe.ecommerce.user.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private List<AddressDto> addresses;
}
