package com.lms.dto;

import lombok.Data;

@Data
public class AttendanceDTO {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private Integer totalClasses;
    private Integer attendedClasses;
    private Double attendancePercentage;
    private Boolean isBelowThreshold;  // true if below 75%
}