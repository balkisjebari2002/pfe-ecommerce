package com.pfe.ecommerce.user.config;

import com.pfe.ecommerce.user.entity.User;
import com.pfe.ecommerce.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@pfe.local")) {
            User admin = User.builder()
                    .email("admin@pfe.local")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("PFE")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin@pfe.local / admin123");
        }
    }
}
