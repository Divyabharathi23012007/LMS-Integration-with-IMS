package com.lms.dto;

public class AuthResponse {

    private Long id;
    private String name;
    private String role;   // String, not enum — easier for JSON + frontend
    private String regNo;

    // ─── Constructor ──────────────────────────────────────────────────────────

    public AuthResponse() {}

    public AuthResponse(Long id, String name, String role, String regNo) {
        this.id    = id;
        this.name  = name;
        this.role  = role;
        this.regNo = regNo;
    }

    // ─── Getters ──────────────────────────────────────────────────────────────

    public Long getId()      { return id; }
    public String getName()  { return name; }
    public String getRole()  { return role; }
    public String getRegNo() { return regNo; }

    // ─── Setters ──────────────────────────────────────────────────────────────

    public void setId(Long id)         { this.id = id; }
    public void setName(String name)   { this.name = name; }
    public void setRole(String role)   { this.role = role; }
    public void setRegNo(String regNo) { this.regNo = regNo; }
}