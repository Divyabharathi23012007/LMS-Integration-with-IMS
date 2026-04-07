package com.lms.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AssignmentDTO {
    private Integer assignmentId;
    private String courseCode;
    private String courseName;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private String submissionStatus; // not_submitted, submitted, graded
    private String gradingStatus;
    private Double marksObtained;
    private Boolean isOverdue;
}