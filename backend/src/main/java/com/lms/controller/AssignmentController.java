package com.lms.controller;

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

import com.lms.service.AssignmentService;
import com.lms.utils.FileUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/{assignmentId}/question")
    public ResponseEntity<byte[]> getQuestionFile(@PathVariable Integer assignmentId) {
        try {
            byte[] data    = assignmentService.getQuestionFile(assignmentId);
            MediaType type = FileUtils.detectMediaType(data);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            FileUtils.inlineDisposition("assignment-" + assignmentId, type))
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .contentType(type)
                    .contentLength(data.length)
                    .body(data);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/{assignmentId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitAssignment(
            @PathVariable Integer assignmentId,
            @RequestParam("regNo") String regNo,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
            assignmentService.submitAssignment(assignmentId, regNo, file);
            return ResponseEntity.ok(Map.of("message", "Assignment submitted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}