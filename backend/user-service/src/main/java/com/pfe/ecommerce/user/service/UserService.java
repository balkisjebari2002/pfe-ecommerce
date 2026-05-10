package com.pfe.ecommerce.user.service;

import com.pfe.ecommerce.user.dto.AddressDto;
import com.pfe.ecommerce.user.dto.UserDto;
import com.pfe.ecommerce.user.entity.Address;
import com.pfe.ecommerce.user.entity.User;
import com.pfe.ecommerce.user.repository.AddressRepository;
import com.pfe.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserDto getProfile(String userId) {
        User user = findUser(userId);
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(String userId, UserDto dto) {
        User user = findUser(userId);
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        return toDto(userRepository.save(user));
    }

    @Transactional
    public AddressDto addAddress(String userId, AddressDto dto) {
        User user = findUser(userId);
        if (dto.isDefault()) {
            addressRepository.findByUserId(user.getId())
                    .forEach(a -> { a.setDefault(false); addressRepository.save(a); });
        }
        Address address = Address.builder()
                .user(user)
                .line1(dto.getLine1())
                .line2(dto.getLine2())
                .city(dto.getCity())
                .postalCode(dto.getPostalCode())
                .country(dto.getCountry())
                .isDefault(dto.isDefault())
                .build();
        Address saved = addressRepository.save(address);
        return toAddressDto(saved);
    }

    @Transactional
    public void deleteAddress(String userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Adresse introuvable"));
        if (!address.getUser().getId().toString().equals(userId)) {
            throw new IllegalArgumentException("Accès refusé");
        }
        addressRepository.delete(address);
    }

    private User findUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole().name());
        dto.setAddresses(addressRepository.findByUserId(user.getId())
                .stream().map(this::toAddressDto).toList());
        return dto;
    }

    private AddressDto toAddressDto(Address a) {
        AddressDto dto = new AddressDto();
        dto.setId(a.getId());
        dto.setLine1(a.getLine1());
        dto.setLine2(a.getLine2());
        dto.setCity(a.getCity());
        dto.setPostalCode(a.getPostalCode());
        dto.setCountry(a.getCountry());
        dto.setDefault(a.isDefault());
        return dto;
    }
}
