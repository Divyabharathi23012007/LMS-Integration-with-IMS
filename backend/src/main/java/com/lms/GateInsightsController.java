package com.lms.controller;

import com.lms.service.GateInsightsService;
import com.lms.service.GateInsightsService.GateInsight;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/gate")
@RequiredArgsConstructor
public class GateInsightsController {

    private final GateInsightsService gateInsightsService;

    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(
            @RequestParam String courseName,
            @RequestParam(defaultValue = "") String courseCode) {
        try {
            GateInsight insight = gateInsightsService.getInsightForCourse(courseName, courseCode);
            if (insight == null) {
                return ResponseEntity.ok(Map.of("available", false));
            }
            return ResponseEntity.ok(Map.of("available", true, "insight", insight));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
