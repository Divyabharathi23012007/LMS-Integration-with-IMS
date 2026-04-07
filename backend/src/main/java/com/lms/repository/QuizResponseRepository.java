package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.QuizResponse;

public interface QuizResponseRepository extends JpaRepository<QuizResponse, Integer> {
    List<QuizResponse> findBySubmissionId(Integer submissionId);
    void deleteBySubmissionId(Integer submissionId);
}