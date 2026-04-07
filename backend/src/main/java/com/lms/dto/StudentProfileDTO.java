package com.lms.dto;

import lombok.Data;

@Data
public class StudentProfileDTO {

    // ── Identity ──────────────────────────────────────────────────
    private String regNo;
    private String name;
    private String dob;            // from LocalDate → toString() → "YYYY-MM-DD"
    private Integer age;
    private String gender;         // enum name: "Male" / "Female" / "Other"
    private String aadharNumber;
    private String umisNumber;

    // ── Academic ──────────────────────────────────────────────────
    private String  department;
    private String  section;
    private Integer semester;
    private String  batch;
    private String  course;
    private Integer admissionYear;

    // ── Contact ───────────────────────────────────────────────────
    private String email;
    private String phone;
}