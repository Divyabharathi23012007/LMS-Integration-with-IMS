package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.StudyMaterial;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Integer> {
    List<StudyMaterial> findByCourseIdOrderByUploadedAtDesc(Integer courseId);
    List<StudyMaterial> findByCourseIdIn(List<Integer> courseIds);
}