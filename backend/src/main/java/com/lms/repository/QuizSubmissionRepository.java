package com.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.QuizSubmission;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Integer> {
    Optional<QuizSubmission> findByQuizIdAndStudentRegNo(Integer quizId, String studentRegNo);
    List<QuizSubmission> findByStudentRegNo(String studentRegNo);
}