package com.lms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reg_no", nullable = false, unique = true, length = 50)
    private String regNo;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Role {
        student, faculty, admin, coordinator
    }
}