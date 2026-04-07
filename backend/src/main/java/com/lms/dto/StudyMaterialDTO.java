package com.lms.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class StudyMaterialDTO {
    private Integer materialId;
    private Integer courseId;
    private String  courseCode;
    private String  courseName;
    private String  title;
    private boolean fileData;      // true = file exists, never send raw bytes in list
    private String  videoLink;
    private String  uploadedBy;
    private LocalDateTime uploadedAt;
}