package com.lms.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lms.dto.AblDTO;
import com.lms.model.AblActivity;
import com.lms.model.AblSubmission;
import com.lms.model.Course;
import com.lms.model.CourseEnrollment;
import com.lms.repository.AblActivityRepository;
import com.lms.repository.AblSubmissionRepository;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.CourseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AblService {

    private final AblActivityRepository   ablRepo;
    private final AblSubmissionRepository submissionRepo;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final CourseRepository        courseRepo;

    // ── Get all ABL activities for student with submission status ─────────────
    public List<AblDTO> getActivitiesForStudent(String regNo) {
        List<Integer> courseIds = enrollmentRepo.findByStudentRegNo(regNo)
                .stream()
                .map(CourseEnrollment::getCourseId)
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) return Collections.emptyList();

        Map<Integer, Course> courseMap = courseRepo.findByCourseIdIn(courseIds)
                .stream()
                .collect(Collectors.toMap(Course::getCourseId, c -> c));

        List<AblActivity> activities = ablRepo.findByCourseIdIn(courseIds);
        if (activities.isEmpty()) return Collections.emptyList();

        List<Integer> ablIds = activities.stream()
                .map(AblActivity::getAblId)
                .collect(Collectors.toList());

        Map<Integer, AblSubmission> submissionMap =
                submissionRepo.findByStudentRegNoAndAblIdIn(regNo, ablIds)
                        .stream()
                        .collect(Collectors.toMap(AblSubmission::getAblId, s -> s));

        LocalDateTime now = LocalDateTime.now();

        return activities.stream().map(a -> {
            AblDTO dto = new AblDTO();
            dto.setAblId(a.getAblId());
            dto.setCourseId(a.getCourseId());
            dto.setTitle(a.getTitle());
            dto.setDescription(a.getDescription());
            dto.setActivityFile(a.getActivityFile() != null && a.getActivityFile().length > 0);
            dto.setActivityLink(a.getActivityLink());
            dto.setDeadline(a.getDeadline());
            dto.setIsOverdue(a.getDeadline() != null && a.getDeadline().isBefore(now));

            Course c = courseMap.get(a.getCourseId());
            if (c != null) {
                dto.setCourseCode(c.getCourseCode());
                dto.setCourseName(c.getCourseName());
            }

            AblSubmission sub = submissionMap.get(a.getAblId());
            if (sub == null) {
                dto.setSubmissionStatus("not_submitted");
            } else {
                dto.setSubmittedAt(sub.getSubmittedAt());
                dto.setMarksObtained(sub.getMarks());
                dto.setGradingStatus(sub.getGradingStatus());
                dto.setSubmissionStatus(
                        "Graded".equalsIgnoreCase(sub.getGradingStatus()) ? "graded" : "submitted"
                );
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // ── Submit ABL activity ───────────────────────────────────────────────────
    public void submitActivity(Integer ablId, String regNo, MultipartFile file) {
        AblActivity activity = ablRepo.findById(ablId)
                .orElseThrow(() -> new RuntimeException("ABL activity not found: " + ablId));

        if (activity.getDeadline() != null && activity.getDeadline().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Deadline has passed. Submission is closed.");

        try {
            Optional<AblSubmission> existing =
                    submissionRepo.findByAblIdAndStudentRegNo(ablId, regNo);

            AblSubmission sub = existing.orElseGet(AblSubmission::new);
            sub.setAblId(ablId);
            sub.setStudentRegNo(regNo);
            sub.setSubmissionFile(file.getBytes());
            sub.setSubmittedAt(LocalDateTime.now());
            sub.setGradingStatus("Pending");
            submissionRepo.save(sub);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save submission: " + e.getMessage());
        }
    }

    // ── Get activity file bytes ───────────────────────────────────────────────
    public byte[] getActivityFile(Integer ablId) {
        AblActivity a = ablRepo.findById(ablId)
                .orElseThrow(() -> new RuntimeException("ABL activity not found: " + ablId));
        if (a.getActivityFile() == null || a.getActivityFile().length == 0)
            throw new RuntimeException("No file for this activity");
        return a.getActivityFile();
    }
}