package com.lms.dto;

import java.util.List;

import lombok.Data;

@Data
public class QuizStartResponseDTO {
    private Integer             submissionId;
    private Integer             quizId;
    private String              title;
    private Integer             timer;
    private List<QuizQuestionDTO> questions;
}