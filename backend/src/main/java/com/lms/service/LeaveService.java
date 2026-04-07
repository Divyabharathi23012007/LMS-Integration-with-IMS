package com.lms.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lms.dto.AttendanceSessionDTO;
import com.lms.dto.LeaveRequestDTO;
import com.lms.model.AttendanceRecord;
import com.lms.model.AttendanceSession;
import com.lms.model.LeaveRequest;
import com.lms.repository.AttendanceRecordRepository;
import com.lms.repository.AttendanceSessionRepository;
import com.lms.repository.LeaveRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository     leaveRepo;
    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository  recordRepo;

    // ── Get all leave requests for student ────────────────────────────────────
    public List<LeaveRequestDTO> getRequests(String regNo) {
        return leaveRepo.findByStudentRegNoOrderByAppliedAtDesc(regNo)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Submit new request ────────────────────────────────────────────────────
    public void applyLeave(String regNo, String leaveType, String reason,
                           LocalDate fromDate, LocalDate toDate, MultipartFile file) {
        if (reason == null || reason.isBlank()) throw new RuntimeException("Reason is required");
        if (fromDate == null || toDate == null)  throw new RuntimeException("Dates are required");
        if (toDate.isBefore(fromDate))           throw new RuntimeException("To date must be after from date");

        LeaveRequest req = new LeaveRequest();
        req.setStudentRegNo(regNo);
        req.setLeaveType(leaveType);
        req.setReason(reason);
        req.setFromDate(fromDate);
        req.setToDate(toDate);
        req.setStatus("Pending");

        if (file != null && !file.isEmpty()) {
            try { req.setDocumentFile(file.getBytes()); }
            catch (Exception e) { throw new RuntimeException("Failed to read document file"); }
        }
        leaveRepo.save(req);
    }

    // ── Get sessions with attendance for a student in a course ────────────────
    public List<AttendanceSessionDTO> getSessionsForCourse(String regNo, Integer courseId) {
        List<AttendanceSession> sessions = sessionRepo.findByCourseId(courseId);
        if (sessions.isEmpty()) return Collections.emptyList();

        List<Integer> sessionIds = sessions.stream()
                .map(AttendanceSession::getSessionId).collect(Collectors.toList());

        Map<Integer, String> recordMap = recordRepo
                .findByStudentRegNoAndSessionIdIn(regNo, sessionIds)
                .stream()
                .collect(Collectors.toMap(AttendanceRecord::getSessionId, AttendanceRecord::getStatus));

        return sessions.stream().map(s -> {
            AttendanceSessionDTO dto = new AttendanceSessionDTO();
            dto.setSessionId(s.getSessionId());
            dto.setClassDate(s.getClassDate());
            dto.setStatus(recordMap.getOrDefault(s.getSessionId(), "Absent"));
            return dto;
        }).sorted((a, b) -> {
            if (a.getClassDate() == null) return 1;
            if (b.getClassDate() == null) return -1;
            return b.getClassDate().compareTo(a.getClassDate()); // newest first
        }).collect(Collectors.toList());
    }

    private LeaveRequestDTO toDTO(LeaveRequest r) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setLeaveId(r.getLeaveId());
        dto.setLeaveType(r.getLeaveType());
        dto.setReason(r.getReason());
        dto.setFromDate(r.getFromDate());
        dto.setToDate(r.getToDate());
        dto.setHasDocument(r.getDocumentFile() != null && r.getDocumentFile().length > 0);
        dto.setStatus(r.getStatus());
        dto.setReviewedBy(r.getReviewedBy());
        dto.setReviewComment(r.getReviewComment());
        dto.setAppliedAt(r.getAppliedAt());
        dto.setReviewedAt(r.getReviewedAt());
        return dto;
    }
}