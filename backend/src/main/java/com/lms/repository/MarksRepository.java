package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.Marks;

public interface MarksRepository extends JpaRepository<Marks, Integer> {
    List<Marks> findByStudentRegNoAndCourseIdIn(String studentRegNo, List<Integer> courseIds);
    java.util.Optional<Marks> findByStudentRegNoAndCourseIdAndEvaluationTypeAndEvaluationLabel(
            String studentRegNo,
            Integer courseId,
            String evaluationType,
            String evaluationLabel);
}