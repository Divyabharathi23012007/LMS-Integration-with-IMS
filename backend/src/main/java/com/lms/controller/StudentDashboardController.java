package com.lms.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lms.dto.StudentDashboardDTO;
import com.lms.model.Announcement;
import com.lms.service.StudentDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final StudentDashboardService service;

    // ───────── FULL DASHBOARD ─────────
    @GetMapping("/dashboard/{regNo}")
    public ResponseEntity<?> getDashboard(@PathVariable String regNo) {
        try {
            StudentDashboardDTO dashboard = service.getFullDashboard(regNo);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── PROFILE ─────────
    @GetMapping("/profile/{regNo}")
    public ResponseEntity<?> getProfile(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getProfile(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── COURSES ─────────
    @GetMapping("/courses/{regNo}")
    public ResponseEntity<?> getCourses(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getCourses(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── ASSIGNMENTS ─────────
    @GetMapping("/assignments/{regNo}")
    public ResponseEntity<?> getAssignments(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getAssignments(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── ATTENDANCE ─────────
    @GetMapping("/attendance/{regNo}")
    public ResponseEntity<?> getAttendance(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getAttendance(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── TIMETABLE ─────────
    @GetMapping("/timetable/{regNo}")
    public ResponseEntity<?> getTimetable(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getTimetable(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── MARKS ─────────
    @GetMapping("/marks/{regNo}")
    public ResponseEntity<?> getMarks(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getMarks(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── ANNOUNCEMENTS ─────────
    @GetMapping("/announcements/{regNo}")
    public ResponseEntity<?> getAnnouncements(@PathVariable String regNo) {
        try {
            List<Announcement> list = service.getAnnouncements(regNo);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── QUIZZES ─────────
    @GetMapping("/quizzes/{regNo}")
    public ResponseEntity<?> getQuizzes(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getQuizzes(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── NOTIFICATIONS ─────────
    @GetMapping("/notifications/{regNo}")
    public ResponseEntity<?> getNotifications(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(service.getNotifications(regNo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── UNREAD COUNT ─────────
    @GetMapping("/notifications/{regNo}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String regNo) {
        try {
            long count = service.getUnreadNotificationCount(regNo);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ───────── MARK AS READ ─────────
    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer notificationId) {
        try {
            service.markNotificationRead(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}