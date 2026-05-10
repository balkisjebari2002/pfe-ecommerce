package com.pfe.ecommerce.user.controller;

import com.pfe.ecommerce.user.dto.AddressDto;
import com.pfe.ecommerce.user.dto.UserDto;
import com.pfe.ecommerce.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(Authentication auth, @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), dto));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<AddressDto> addAddress(Authentication auth, @Valid @RequestBody AddressDto dto) {
        return ResponseEntity.ok(userService.addAddress(auth.getName(), dto));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(Authentication auth, @PathVariable UUID addressId) {
        userService.deleteAddress(auth.getName(), addressId);
        return ResponseEntity.noContent().build();
    }
}
