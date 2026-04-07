package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.AblActivity;

public interface AblActivityRepository extends JpaRepository<AblActivity, Integer> {
    List<AblActivity> findByCourseIdIn(List<Integer> courseIds);
    List<AblActivity> findByCourseId(Integer courseId);
}