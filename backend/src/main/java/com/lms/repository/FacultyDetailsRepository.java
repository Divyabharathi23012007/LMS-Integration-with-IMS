package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.FacultyDetails;

public interface FacultyDetailsRepository extends JpaRepository<FacultyDetails, String> {
    List<FacultyDetails> findByFacultyIdIn(List<String> facultyIds);
}