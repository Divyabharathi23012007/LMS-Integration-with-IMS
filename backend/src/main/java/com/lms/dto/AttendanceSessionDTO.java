package com.lms.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class AttendanceSessionDTO {
    private Integer   sessionId;
    private LocalDate classDate;
    private String    status;     // "Present" | "Absent"
}