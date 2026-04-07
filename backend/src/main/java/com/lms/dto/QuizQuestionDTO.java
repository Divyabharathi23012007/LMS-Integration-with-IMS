package com.lms.dto;

import lombok.Data;

@Data
public class QuizQuestionDTO {
    private Integer questionId;
    private Integer quizId;
    private String  questionText;
    private String  optionA;
    private String  optionB;
    private String  optionC;
    private String  optionD;
    private Double  marks;
    // correctOption is intentionally OMITTED — never expose to frontend
}