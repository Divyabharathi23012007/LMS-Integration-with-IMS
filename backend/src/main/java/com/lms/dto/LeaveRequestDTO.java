package com.lms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class LeaveRequestDTO {
    private Integer       leaveId;
    private String        leaveType;
    private String        reason;
    private LocalDate     fromDate;
    private LocalDate     toDate;
    private boolean       hasDocument;
    private String        status;
    private String        reviewedBy;
    private String        reviewComment;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
}