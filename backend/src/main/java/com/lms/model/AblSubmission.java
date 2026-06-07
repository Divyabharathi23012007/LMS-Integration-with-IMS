package com.lms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "abl_submissions")
public class AblSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Integer submissionId;

    @Column(name = "abl_id", nullable = false)
    private Integer ablId;

    @Column(name = "student_reg_no", nullable = false)
    private String studentRegNo;

    @Lob
    @Column(name = "submission_file", columnDefinition = "LONGBLOB")
    private byte[] submissionFile;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "marks")
    private Double marks;

    @Column(name = "grading_status")
    private String gradingStatus;   // "Pending" | "Graded"

    private String feedback;
}