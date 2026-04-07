package com.lms.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lms.dto.AblDTO;
import com.lms.service.AblService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/abl")
@RequiredArgsConstructor
public class AblController {

    private final AblService ablService;

    // ── GET /api/student/abl/{regNo} ─────────────────────────────────────────
    @GetMapping("/{regNo}")
    public ResponseEntity<List<AblDTO>> getActivities(@PathVariable String regNo) {
        return ResponseEntity.ok(ablService.getActivitiesForStudent(regNo));
    }

    // ── GET /api/student/abl/{ablId}/file ────────────────────────────────────
    @GetMapping("/{ablId}/file")
    public ResponseEntity<byte[]> getActivityFile(@PathVariable Integer ablId) {
        try {
            byte[] data = ablService.getActivityFile(ablId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"abl-activity-" + ablId + ".pdf\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(data);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── POST /api/student/abl/{ablId}/submit ─────────────────────────────────
    @PostMapping(value = "/{ablId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitActivity(
            @PathVariable Integer ablId,
            @RequestParam("regNo") String regNo,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "File is required"));

            ablService.submitActivity(ablId, regNo, file);
            return ResponseEntity.ok(Map.of("message", "Activity submitted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}