package com.lms.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lms.dto.AuthResponse;
import com.lms.model.User;
import com.lms.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // ─── SHA2-256 Hashing Utility ───────────────────────────────
    private String hashSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));

            // Convert bytes to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    // ─── Username + Password Login ──────────────────────────────
    public AuthResponse login(String username, String password) {

        // Hash the incoming password using SHA2-256
        String hashedPassword = hashSHA256(password);

        // Find user with matching username and hashed password
        Optional<User> userOpt = userRepository.findByUsernameAndHashedPassword(username, hashedPassword);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOpt.get();
        return buildResponse(user);
    }

    // ─── QR Code Login ──────────────────────────────────────────
    public AuthResponse qrLogin(String regNo) {

        // Find user by registration number
        Optional<User> userOpt = userRepository.findByRegNo(regNo);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not registered");
        }

        User user = userOpt.get();
        return buildResponse(user);
    }

    // ─── Build Response Object ──────────────────────────────────
    private AuthResponse buildResponse(User user) {
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getRole().name(),
                user.getRegNo()
        );
    }
}