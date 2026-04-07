package com.lms.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private String facultyName;
    private String facultyId;
}