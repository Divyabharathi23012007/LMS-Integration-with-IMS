package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String name;
    private String role;
    private String regNo;
}