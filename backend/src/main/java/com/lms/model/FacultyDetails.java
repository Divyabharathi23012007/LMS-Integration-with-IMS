package com.lms.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "faculty_details")
public class FacultyDetails {

    @Id
    @Column(name = "faculty_id")
    private String facultyId;

    private String name;
    private String department;
    private String email;
    private String phone;

    @Column(name = "profile_image")
    private byte[] profileImage;
}