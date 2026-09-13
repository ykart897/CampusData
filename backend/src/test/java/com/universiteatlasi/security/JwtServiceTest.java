package com.universiteatlasi.security;

import com.universiteatlasi.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "test-secret-key-with-at-least-32-chars");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 60_000L);
    }

    @Test
    void activeUserTokenIsValid() {
        User user = user(true);
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void inactiveUserTokenIsRejected() {
        User user = user(true);
        String token = jwtService.generateToken(user);
        user.setActive(false);

        assertThat(jwtService.isTokenValid(token, user)).isFalse();
    }

    @Test
    void tokenIsRejectedAfterVersionChanges() {
        User user = user(true);
        String token = jwtService.generateToken(user);
        user.setTokenVersion(user.getTokenVersion() + 1);

        assertThat(jwtService.isTokenValid(token, user)).isFalse();
    }

    @Test
    void tokenWithoutVersionIsRejectedForApplicationUser() {
        User user = user(true);
        org.springframework.security.core.userdetails.User legacyUser =
            new org.springframework.security.core.userdetails.User(
                user.getUsername(), "unused", user.getAuthorities()
            );
        String legacyToken = jwtService.generateToken(legacyUser);

        assertThat(jwtService.isTokenValid(legacyToken, user)).isFalse();
    }

    private User user(boolean active) {
        return User.builder()
            .email("ogrenci@example.com")
            .passwordHash("unused")
            .active(active)
            .build();
    }
}
