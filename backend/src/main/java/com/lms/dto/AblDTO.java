package com.lms.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AblDTO {
    private Integer  ablId;
    private Integer  courseId;
    private String   courseCode;
    private String   courseName;
    private String   title;
    private String   description;
    private boolean  activityFile;   // true = file exists
    private String   activityLink;
    private LocalDateTime deadline;
    private Boolean  isOverdue;

    // Submission info (null if not submitted)
    private String   submissionStatus;   // "not_submitted" | "submitted" | "graded"
    private String   gradingStatus;
    private Double   marksObtained;
    private LocalDateTime submittedAt;
}