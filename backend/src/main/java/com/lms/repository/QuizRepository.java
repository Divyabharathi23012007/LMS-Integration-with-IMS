package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    List<Quiz> findByCourseIdIn(List<Integer> courseIds);
}