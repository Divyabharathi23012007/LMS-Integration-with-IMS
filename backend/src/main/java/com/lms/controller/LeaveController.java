package com.lms.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lms.dto.AttendanceSessionDTO;
import com.lms.dto.LeaveRequestDTO;
import com.lms.service.LeaveService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // ── GET /api/student/leave/{regNo} ───────────────────────────────────────
    @GetMapping("/leave/{regNo}")
    public ResponseEntity<List<LeaveRequestDTO>> getRequests(@PathVariable String regNo) {
        return ResponseEntity.ok(leaveService.getRequests(regNo));
    }

    // ── POST /api/student/leave/apply ────────────────────────────────────────
    @PostMapping(value = "/leave/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> applyLeave(
            @RequestParam("regNo")     String regNo,
            @RequestParam("leaveType") String leaveType,
            @RequestParam("reason")    String reason,
            @RequestParam("fromDate")  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam("toDate")    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            leaveService.applyLeave(regNo, leaveType, reason, fromDate, toDate, file);
            return ResponseEntity.ok(Map.of("message", "Leave request submitted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/student/attendance/{regNo}/course/{courseId}/sessions ───────
    // Returns all sessions for a course with student's present/absent status
    @GetMapping("/attendance/{regNo}/course/{courseId}/sessions")
    public ResponseEntity<List<AttendanceSessionDTO>> getCourseSessions(
            @PathVariable String regNo,
            @PathVariable Integer courseId) {
        return ResponseEntity.ok(leaveService.getSessionsForCourse(regNo, courseId));
    }
}