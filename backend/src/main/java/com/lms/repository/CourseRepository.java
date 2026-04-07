package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.Course;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByCourseIdIn(List<Integer> courseIds);
}