package com.lms.dto;

import lombok.Data;

@Data
public class TimetableDTO {
    private String  dayOfWeek;
    private Integer periodNumber;
    private String  periodType;    // "class" | "break" | "lunch break"
    private String  startTime;
    private String  endTime;
    private String  courseCode;
    private String  courseName;
    private String  facultyName;
    private String  classroom;
}