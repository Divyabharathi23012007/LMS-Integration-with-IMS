package com.lms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ─── Security Filter Chain ──────────────────────────────────
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for REST APIs)
            .csrf(csrf -> csrf.disable())

            // Apply CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Session management — stateless (no server-side sessions)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow login endpoints without authentication
                .requestMatchers("/api/auth/**").permitAll()
                // All other endpoints require authentication (for future use)
                .anyRequest().authenticated()
            );

        return http.build();
    }

    // ─── CORS Configuration ─────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow React frontend origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // Allow standard HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers
        config.setAllowedHeaders(List.of("*"));

        // Allow credentials (cookies, auth headers)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}