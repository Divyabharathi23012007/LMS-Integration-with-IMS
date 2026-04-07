package com.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.AblSubmission;

public interface AblSubmissionRepository extends JpaRepository<AblSubmission, Integer> {
    Optional<AblSubmission> findByAblIdAndStudentRegNo(Integer ablId, String studentRegNo);
    List<AblSubmission> findByStudentRegNoAndAblIdIn(String studentRegNo, List<Integer> ablIds);
}