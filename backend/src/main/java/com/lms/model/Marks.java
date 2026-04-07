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
@Table(name = "marks")
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mark_id")
    private Integer markId;

    @Column(name = "student_reg_no")
    private String studentRegNo;

    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "evaluation_type")
    private String evaluationType;

    @Column(name = "evaluation_label")
    private String evaluationLabel;

    @Column(name = "marks_obtained")
    private Double marksObtained;

    @Column(name = "max_marks")
    private Double maxMarks;

    @Column(name = "recorded_by")
    private String recordedBy;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}