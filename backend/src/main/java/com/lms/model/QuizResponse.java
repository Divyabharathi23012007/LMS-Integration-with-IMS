package com.lms.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(name = "quiz_responses",
       uniqueConstraints = @UniqueConstraint(columnNames = {"submission_id", "question_id"}))
public class QuizResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "response_id")
    private Integer responseId;

    @Column(name = "submission_id", nullable = false)
    private Integer submissionId;

    @Column(name = "question_id", nullable = false)
    private Integer questionId;

    @Column(name = "selected_option")   // "A"|"B"|"C"|"D" or null if skipped
    private String selectedOption;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_awarded")
    private Double marksAwarded = 0.0;
}