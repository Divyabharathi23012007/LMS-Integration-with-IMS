package com.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.AssignmentSubmission;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Integer> {
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentRegNo(Integer assignmentId, String studentRegNo);
    List<AssignmentSubmission> findByStudentRegNoAndAssignmentIdIn(String studentRegNo, List<Integer> assignmentIds);
    List<AssignmentSubmission> findByAssignmentId(Integer assignmentId);
}