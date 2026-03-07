package com.lms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lms.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ─── Find by username (for password login) ─────────────────
    Optional<User> findByUsername(String username);

    // ─── Find by reg_no (for QR login) ─────────────────────────
    Optional<User> findByRegNo(String regNo);

    // ─── Find by username and SHA2-256 hashed password ─────────
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.password = :hashedPassword")
    Optional<User> findByUsernameAndHashedPassword(
            @Param("username") String username,
            @Param("hashedPassword") String hashedPassword
    );
}