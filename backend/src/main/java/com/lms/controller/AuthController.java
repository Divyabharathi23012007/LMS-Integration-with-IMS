package com.lms.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.dto.AuthResponse;
import com.lms.dto.LoginRequest;
import com.lms.dto.QrLoginRequest;
import com.lms.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ─── POST /api/auth/login ───────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── POST /api/auth/qr-login ────────────────────────────────
    @PostMapping("/qr-login")
    public ResponseEntity<?> qrLogin(@RequestBody QrLoginRequest request) {
        try {
            AuthResponse response = authService.qrLogin(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── PUT /api/auth/change-password ──────────────────────────
    // Body: { "regNo": "...", "currentPassword": "...", "newPassword": "..." }
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        try {
            String regNo           = body.get("regNo");
            String currentPassword = body.get("currentPassword");
            String newPassword     = body.get("newPassword");

            if (regNo == null || currentPassword == null || newPassword == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "regNo, currentPassword and newPassword are required"));
            }

            authService.changePassword(regNo, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}