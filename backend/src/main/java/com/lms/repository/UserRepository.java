package com.lms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lms.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used by AuthService for password login
    Optional<User> findByUsername(String username);

    // Used by AuthService for QR login + fallback lookup
    Optional<User> findByRegNo(String regNo);

    // Optional: find by email if you add email field later
    // Optional<User> findByEmail(String email);
}