package com.pfe.ecommerce.user.service;

import com.pfe.ecommerce.security.JwtUtils;
import com.pfe.ecommerce.user.dto.AuthResponse;
import com.pfe.ecommerce.user.dto.LoginRequest;
import com.pfe.ecommerce.user.dto.RegisterRequest;
import com.pfe.ecommerce.user.entity.User;
import com.pfe.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Un compte avec cet email existe déjà.");
        }
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(User.Role.USER)
                .build();
        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getId().toString(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect."));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect.");
        }
        String token = jwtUtils.generateToken(user.getId().toString(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name());
    }
}
