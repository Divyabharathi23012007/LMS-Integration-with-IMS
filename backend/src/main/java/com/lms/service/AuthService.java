package com.lms.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lms.dto.AuthResponse;
import com.lms.dto.LoginRequest;
import com.lms.dto.QrLoginRequest;
import com.lms.model.User;
import com.lms.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByRegNo(request.getUsername());
        }
        User user = userOpt.orElseThrow(() ->
            new RuntimeException("User not found: " + request.getUsername()));

        String rawPassword      = request.getPassword();
        String hashedInput      = sha256(rawPassword);
        String storedPassword   = user.getPassword();

        boolean passwordMatches = hashedInput.equalsIgnoreCase(storedPassword)
            || rawPassword.equals(storedPassword);

        if (!passwordMatches) {
            throw new RuntimeException("Invalid password");
        }

        return new AuthResponse(
            user.getId(),
            user.getName(),
            user.getRole().name().toLowerCase(),  // ← ALWAYS lowercase: "student" not "STUDENT"
            user.getRegNo()
        );
    }

    public AuthResponse qrLogin(QrLoginRequest request) {
        User user = userRepository.findByRegNo(request.getRegNo())
            .orElseThrow(() ->
                new RuntimeException("Student not found: " + request.getRegNo()));

        return new AuthResponse(
            user.getId(),
            user.getName(),
            user.getRole().name().toLowerCase(),  // ← lowercase
            user.getRegNo()
        );
    }

    public void changePassword(String regNo, String currentPassword, String newPassword) {
        User user = userRepository.findByRegNo(regNo)
            .orElseThrow(() -> new RuntimeException("User not found: " + regNo));

        if (!sha256(currentPassword).equalsIgnoreCase(user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(sha256(newPassword));
        userRepository.save(user);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 hashing failed", e);
        }
    }
}