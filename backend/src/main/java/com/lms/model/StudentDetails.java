package com.lms.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "student_details")
public class StudentDetails {

    @Id
    @Column(name = "reg_no")
    private String regNo;

    private String name;

    @Column(name = "aadhar_number")
    private String aadharNumber;

    @Column(name = "umis_number")
    private String umisNumber;

    private String dob;
    private Integer age;
    private String gender;
    private String department;
    private String section;
    private String email;
    private String phone;

    @Column(name = "admission_year")
    private Integer admissionYear;

    private String course;
    private Integer semester;
    private String batch;
}