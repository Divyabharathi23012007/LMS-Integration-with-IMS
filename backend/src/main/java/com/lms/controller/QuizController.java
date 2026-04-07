package com.lms.controller;

import com.lms.dto.QuizResultDTO;
import com.lms.dto.QuizStartResponseDTO;
import com.lms.dto.QuizSubmitRequestDTO;
import com.lms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // ── GET /api/student/quiz/submissions/{regNo} ────────────────────────────
    // Returns all quiz submissions for a student (for Attempted tab)
    @GetMapping("/submissions/{regNo}")
    public ResponseEntity<?> getSubmissions(@PathVariable String regNo) {
        try {
            return ResponseEntity.ok(quizService.getSubmissionsForStudent(regNo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/student/quiz/{quizId}/start ────────────────────────────────
    // Body: { "regNo": "..." }
    // Returns: submissionId + questions (NO correct answers)
    @PostMapping("/{quizId}/start")
    public ResponseEntity<?> startQuiz(
            @PathVariable Integer quizId,
            @RequestBody Map<String, String> body) {
        try {
            String regNo = body.get("regNo");
            if (regNo == null || regNo.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "regNo is required"));

            QuizStartResponseDTO resp = quizService.startQuiz(quizId, regNo);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/student/quiz/submission/{submissionId}/submit ──────────────
    // Body: { "responses": [{ "questionId": 1, "selectedOption": "A" }, ...] }
    // Returns: result (marks shown only if showResult=true)
    @PostMapping("/submission/{submissionId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Integer submissionId,
            @RequestBody QuizSubmitRequestDTO request) {
        try {
            QuizResultDTO result = quizService.submitQuiz(submissionId, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}