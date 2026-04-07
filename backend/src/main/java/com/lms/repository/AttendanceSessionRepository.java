package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.AttendanceSession;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Integer> {
    List<AttendanceSession> findByCourseId(Integer courseId);
    List<AttendanceSession> findByCourseIdIn(List<Integer> courseIds);
}