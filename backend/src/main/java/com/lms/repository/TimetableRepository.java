package com.lms.repository;

import com.lms.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Integer> {
    List<Timetable> findByDepartmentAndSectionAndSemesterOrderByDayOfWeekAscPeriodNumberAsc(
        String department, String section, Integer semester);
}