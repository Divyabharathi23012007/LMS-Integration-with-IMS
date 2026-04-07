package com.lms.dto;

import java.util.List;

import com.lms.model.Announcement;

import lombok.Data;

@Data
public class StudentDashboardDTO {

    private StudentProfileDTO profile;
    private List<CourseDTO> courses;
    private List<AssignmentDTO> assignments;
    private List<AttendanceDTO> attendance;
    private List<TimetableDTO> timetable;
    private List<MarksDTO> marks;
    private List<Announcement> announcements;
    private List<QuizDTO> quizzes;
    private List<NotificationDTO> notifications;
    private Long unreadNotificationCount;

}