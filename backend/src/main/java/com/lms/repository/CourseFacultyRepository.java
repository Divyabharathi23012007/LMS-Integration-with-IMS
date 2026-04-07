package com.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.CourseFaculty;

public interface CourseFacultyRepository extends JpaRepository<CourseFaculty, Integer> {
    Optional<CourseFaculty> findByCourseId(Integer courseId);
    List<CourseFaculty> findByCourseIdIn(List<Integer> courseIds);
}