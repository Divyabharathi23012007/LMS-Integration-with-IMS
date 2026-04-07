package com.lms.repository;
import com.lms.model.StudentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentDetailsRepository extends JpaRepository<StudentDetails, String> {}