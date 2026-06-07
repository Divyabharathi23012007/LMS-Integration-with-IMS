package com.lms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Integer submissionId;

    @Column(name = "assignment_id")
    private Integer assignmentId;

    @Column(name = "student_reg_no")
    private String studentRegNo;

    @Column(name = "submission_file")
    private byte[] submissionFile;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    private Double marks;

    @Column(name = "grading_status")
    private String gradingStatus; // pending, graded

    private String feedback;
}