package com.lms.controller;

import com.lms.dto.StudyMaterialDTO;
import com.lms.service.StudyMaterialService;
import com.lms.utils.FileUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/study-material")
@RequiredArgsConstructor
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<StudyMaterialDTO>> getByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(studyMaterialService.getMaterialsByCourse(courseId));
    }

    @GetMapping("/student/{regNo}")
    public ResponseEntity<List<StudyMaterialDTO>> getForStudent(@PathVariable String regNo) {
        return ResponseEntity.ok(studyMaterialService.getAllMaterialsForStudent(regNo));
    }

    @GetMapping("/{materialId}/view")
    public ResponseEntity<byte[]> viewFile(@PathVariable Integer materialId) {
        try {
            byte[] data    = studyMaterialService.getFileBytes(materialId);
            MediaType type = FileUtils.detectMediaType(data);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            FileUtils.inlineDisposition("material-" + materialId, type))
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .contentType(type)
                    .contentLength(data.length)
                    .body(data);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{materialId}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Integer materialId) {
        try {
            byte[] data    = studyMaterialService.getFileBytes(materialId);
            MediaType type = FileUtils.detectMediaType(data);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            FileUtils.attachmentDisposition("material-" + materialId, type))
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(data.length)
                    .body(data);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}