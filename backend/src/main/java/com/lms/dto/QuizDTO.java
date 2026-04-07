package com.lms.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QuizDTO {
    private Integer quizId;
    private String courseCode;
    private String courseName;
    private String title;
    private LocalDateTime deadline;
    private Integer timer;
    private Boolean isOverdue;
}