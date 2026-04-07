package com.lms.dto;

import lombok.Data;

@Data
public class QuizResultDTO {
    private Integer submissionId;
    private Boolean showResult;
    private Double  totalMarks;
    private Double  obtainedMarks;
    private Double  percentage;
}