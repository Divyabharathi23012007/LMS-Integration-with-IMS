package com.lms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(name = "quiz_submissions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"quiz_id", "student_reg_no"}))
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Integer submissionId;

    @Column(name = "quiz_id", nullable = false)
    private Integer quizId;

    @Column(name = "student_reg_no", nullable = false)
    private String studentRegNo;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_submitted", nullable = false)
    private Boolean isSubmitted = false;

    @Column(name = "total_marks")
    private Double totalMarks = 0.0;

    @Column(name = "obtained_marks")
    private Double obtainedMarks = 0.0;

    @Column(name = "percentage")
    private Double percentage = 0.0;

    @Column(name = "show_result", nullable = false)
    private Boolean showResult = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}