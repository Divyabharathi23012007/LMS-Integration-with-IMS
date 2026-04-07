package com.lms.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "leave_od_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_id")
    private Integer leaveId;

    @Column(name = "student_reg_no", nullable = false)
    private String studentRegNo;

    @Column(name = "leave_type")
    private String leaveType;          // "leave" | "on-duty"

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "from_date")
    private LocalDate fromDate;

    @Column(name = "to_date")
    private LocalDate toDate;

    @Lob
    @Column(name = "document_file", columnDefinition = "LONGBLOB")
    private byte[] documentFile;

    @Column(name = "status")
    private String status = "Pending"; // "Pending" | "Approved" | "Rejected"

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "review_comment")
    private String reviewComment;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() { this.appliedAt = LocalDateTime.now(); }
}