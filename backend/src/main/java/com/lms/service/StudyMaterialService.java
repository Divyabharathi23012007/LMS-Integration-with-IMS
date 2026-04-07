package com.lms.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.lms.dto.StudyMaterialDTO;
import com.lms.model.Course;
import com.lms.model.CourseEnrollment;
import com.lms.model.StudyMaterial;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.StudyMaterialRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudyMaterialService {

    private final StudyMaterialRepository  materialRepo;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final CourseRepository         courseRepo;

    // ── Get materials for one course (student must be enrolled) ──────────────
    public List<StudyMaterialDTO> getMaterialsByCourse(Integer courseId) {
        List<StudyMaterial> materials =
                materialRepo.findByCourseIdOrderByUploadedAtDesc(courseId);

        Course course = courseRepo.findById(courseId).orElse(null);

        return materials.stream().map(m -> toDTO(m, course)).collect(Collectors.toList());
    }

    // ── Get all materials grouped — used for full page list ──────────────────
    public List<StudyMaterialDTO> getAllMaterialsForStudent(String regNo) {
        List<Integer> courseIds = enrollmentRepo.findByStudentRegNo(regNo)
                .stream()
                .map(CourseEnrollment::getCourseId)
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) return Collections.emptyList();

        Map<Integer, Course> courseMap = courseRepo.findByCourseIdIn(courseIds)
                .stream()
                .collect(Collectors.toMap(Course::getCourseId, c -> c));

        return materialRepo.findByCourseIdIn(courseIds)
                .stream()
                .map(m -> toDTO(m, courseMap.get(m.getCourseId())))
                .collect(Collectors.toList());
    }

    // ── Stream raw file bytes for view/download ───────────────────────────────
    public byte[] getFileBytes(Integer materialId) {
        StudyMaterial m = materialRepo.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found: " + materialId));
        if (m.getFileData() == null || m.getFileData().length == 0)
            throw new RuntimeException("No file for this material");
        return m.getFileData();
    }

    // ── DTO mapper — never sends raw bytes, just a boolean flag ──────────────
    private StudyMaterialDTO toDTO(StudyMaterial m, Course course) {
        StudyMaterialDTO dto = new StudyMaterialDTO();
        dto.setMaterialId(m.getMaterialId());
        dto.setCourseId(m.getCourseId());
        dto.setTitle(m.getTitle());
        dto.setFileData(m.getFileData() != null && m.getFileData().length > 0);
        dto.setVideoLink(m.getVideoLink());
        dto.setUploadedBy(m.getUploadedBy());
        dto.setUploadedAt(m.getUploadedAt());
        if (course != null) {
            dto.setCourseCode(course.getCourseCode());
            dto.setCourseName(course.getCourseName());
        }
        return dto;
    }
}