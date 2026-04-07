package com.lms.model;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "timetable")
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "timetable_id")
    private Integer timetableId;

    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "department")
    private String department;

    @Column(name = "section")
    private String section;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "day_of_week")
    private String dayOfWeek;

    @Column(name = "period_number")
    private Integer periodNumber;

    // "class" | "break" | "lunch break"
    @Column(name = "period_type")
    private String periodType;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "classroom")
    private String classroom;
}