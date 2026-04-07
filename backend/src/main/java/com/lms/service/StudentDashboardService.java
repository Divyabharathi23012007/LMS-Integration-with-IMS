package com.lms.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.lms.dto.AssignmentDTO;
import com.lms.dto.AttendanceDTO;
import com.lms.dto.CourseDTO;
import com.lms.dto.MarksDTO;
import com.lms.dto.NotificationDTO;
import com.lms.dto.QuizDTO;
import com.lms.dto.StudentDashboardDTO;
import com.lms.dto.StudentProfileDTO;
import com.lms.dto.TimetableDTO;
import com.lms.model.Announcement;
import com.lms.model.Assignment;
import com.lms.model.AssignmentSubmission;
import com.lms.model.AttendanceRecord;
import com.lms.model.AttendanceSession;
import com.lms.model.Course;
import com.lms.model.CourseEnrollment;
import com.lms.model.CourseFaculty;
import com.lms.model.FacultyDetails;
import com.lms.model.Marks;
import com.lms.model.StudentDetails;
import com.lms.model.Timetable;
import com.lms.repository.AnnouncementRepository;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.AssignmentSubmissionRepository;
import com.lms.repository.AttendanceRecordRepository;
import com.lms.repository.AttendanceSessionRepository;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.CourseFacultyRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.FacultyDetailsRepository;
import com.lms.repository.MarksRepository;
import com.lms.repository.NotificationRepository;
import com.lms.repository.QuizRepository;
import com.lms.repository.StudentDetailsRepository;
import com.lms.repository.TimetableRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentDashboardService {

    private final StudentDetailsRepository       studentDetailsRepo;
    private final CourseEnrollmentRepository     enrollmentRepo;
    private final CourseRepository               courseRepo;
    private final CourseFacultyRepository        courseFacultyRepo;
    private final FacultyDetailsRepository       facultyDetailsRepo;
    private final AssignmentRepository           assignmentRepo;
    private final AssignmentSubmissionRepository submissionRepo;
    private final AttendanceSessionRepository    sessionRepo;
    private final AttendanceRecordRepository     recordRepo;
    private final AnnouncementRepository         announcementRepo;
    private final QuizRepository                 quizRepo;
    private final TimetableRepository            timetableRepo;
    private final MarksRepository                marksRepo;
    private final NotificationRepository         notificationRepo;

    private static final double ATTENDANCE_THRESHOLD = 75.0;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ─────────────────────────────────────────────────────────────────────────
    // Shared context — fetched ONCE, reused by all builders
    // ─────────────────────────────────────────────────────────────────────────

    private static class StudentContext {
        final StudentDetails       student;
        final List<Integer>        courseIds;
        final Map<Integer, Course> courseMap;
        final Map<Integer, String> facultyMap;   // courseId → facultyName

        StudentContext(StudentDetails student,
                       List<Integer> courseIds,
                       Map<Integer, Course> courseMap,
                       Map<Integer, String> facultyMap) {
            this.student    = student;
            this.courseIds  = courseIds;
            this.courseMap  = courseMap;
            this.facultyMap = facultyMap;
        }
    }

    private StudentContext buildContext(String regNo) {
        StudentDetails student = studentDetailsRepo.findById(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found: " + regNo));

        List<Integer> courseIds = enrollmentRepo.findByStudentRegNo(regNo)
                .stream()
                .map(CourseEnrollment::getCourseId)
                .collect(Collectors.toList());

        if (courseIds.isEmpty()) {
            return new StudentContext(student, courseIds,
                    Collections.emptyMap(), Collections.emptyMap());
        }

        Map<Integer, Course> courseMap = courseRepo.findByCourseIdIn(courseIds)
                .stream()
                .collect(Collectors.toMap(Course::getCourseId, c -> c));

        List<CourseFaculty> cfList = courseFacultyRepo.findByCourseIdIn(courseIds);
        List<String> facultyIds = cfList.stream()
                .map(CourseFaculty::getFacultyId)
                .distinct()
                .collect(Collectors.toList());
        Map<String, String> nameById = facultyDetailsRepo.findByFacultyIdIn(facultyIds)
                .stream()
                .collect(Collectors.toMap(FacultyDetails::getFacultyId, FacultyDetails::getName));
        Map<Integer, String> facultyMap = new HashMap<>();
        cfList.forEach(cf -> facultyMap.put(cf.getCourseId(),
                nameById.getOrDefault(cf.getFacultyId(), "N/A")));

        return new StudentContext(student, courseIds, courseMap, facultyMap);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Full dashboard — CompletableFuture parallel fetch (existing pattern kept)
    // ─────────────────────────────────────────────────────────────────────────

    public StudentDashboardDTO getFullDashboard(String regNo) {

        StudentContext ctx = buildContext(regNo);

        CompletableFuture<List<CourseDTO>>      courses     = CompletableFuture.supplyAsync(() -> buildCourses(ctx));
        CompletableFuture<List<AssignmentDTO>>  assignments = CompletableFuture.supplyAsync(() -> buildAssignments(ctx, regNo));
        CompletableFuture<List<AttendanceDTO>>  attendance  = CompletableFuture.supplyAsync(() -> buildAttendance(ctx, regNo));
        CompletableFuture<List<TimetableDTO>>   timetable   = CompletableFuture.supplyAsync(() -> buildTimetable(ctx));
        CompletableFuture<List<MarksDTO>>       marks       = CompletableFuture.supplyAsync(() -> buildMarks(ctx, regNo));
        CompletableFuture<List<Announcement>>   announcements = CompletableFuture.supplyAsync(() ->
                ctx.courseIds.isEmpty() ? List.of()
                        : announcementRepo.findByCourseIdInOrderByCreatedAtDesc(ctx.courseIds));
        CompletableFuture<List<QuizDTO>>        quizzes       = CompletableFuture.supplyAsync(() ->
                ctx.courseIds.isEmpty() ? List.of() : buildQuizzes(ctx));
        CompletableFuture<List<NotificationDTO>> notifications = CompletableFuture.supplyAsync(() -> getNotifications(regNo));
        CompletableFuture<Long>                  unread        = CompletableFuture.supplyAsync(() -> getUnreadNotificationCount(regNo));

        CompletableFuture.allOf(
                courses, assignments, attendance, timetable,
                marks, announcements, quizzes, notifications, unread
        ).join();

        StudentDashboardDTO dto = new StudentDashboardDTO();
        dto.setProfile(toProfileDTO(ctx.student));
        dto.setCourses(courses.join());
        dto.setAssignments(assignments.join());
        dto.setAttendance(attendance.join());
        dto.setTimetable(timetable.join());
        dto.setMarks(marks.join());
        dto.setAnnouncements(announcements.join());
        dto.setQuizzes(quizzes.join());
        dto.setNotifications(notifications.join());
        dto.setUnreadNotificationCount(unread.join());

        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Profile
    // ─────────────────────────────────────────────────────────────────────────

    public StudentProfileDTO getProfile(String regNo) {
        StudentDetails sd = studentDetailsRepo.findById(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found: " + regNo));
        return toProfileDTO(sd);
    }

    private StudentProfileDTO toProfileDTO(StudentDetails sd) {
        StudentProfileDTO dto = new StudentProfileDTO();
        dto.setRegNo(sd.getRegNo());
        dto.setName(sd.getName());
        dto.setDob(sd.getDob() != null ? sd.getDob().toString() : null);
        dto.setAge(sd.getAge());
        dto.setGender(sd.getGender());          // String in model — no .name() needed
        dto.setAadharNumber(sd.getAadharNumber());
        dto.setUmisNumber(sd.getUmisNumber());
        dto.setDepartment(sd.getDepartment());
        dto.setSection(sd.getSection());
        dto.setSemester(sd.getSemester());
        dto.setBatch(sd.getBatch());
        dto.setEmail(sd.getEmail());
        dto.setPhone(sd.getPhone());
        dto.setCourse(sd.getCourse());
        dto.setAdmissionYear(sd.getAdmissionYear());
        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Courses
    // ─────────────────────────────────────────────────────────────────────────

    public List<CourseDTO> getCourses(String regNo) {
        return buildCourses(buildContext(regNo));
    }

    private List<CourseDTO> buildCourses(StudentContext ctx) {
        return ctx.courseIds.stream()
                .filter(ctx.courseMap::containsKey)
                .map(id -> {
                    Course c = ctx.courseMap.get(id);
                    CourseDTO dto = new CourseDTO();
                    dto.setCourseId(c.getCourseId());
                    dto.setCourseCode(c.getCourseCode());
                    dto.setCourseName(c.getCourseName());
                    dto.setFacultyName(ctx.facultyMap.getOrDefault(id, "N/A"));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Assignments
    // ─────────────────────────────────────────────────────────────────────────

    public List<AssignmentDTO> getAssignments(String regNo) {
        StudentContext ctx = buildContext(regNo);
        if (ctx.courseIds.isEmpty()) return Collections.emptyList();
        return buildAssignments(ctx, regNo);
    }

    private List<AssignmentDTO> buildAssignments(StudentContext ctx, String regNo) {
        List<Assignment> assignments = assignmentRepo.findByCourseIdIn(ctx.courseIds);
        if (assignments.isEmpty()) return Collections.emptyList();

        List<Integer> assignmentIds = assignments.stream()
                .map(Assignment::getAssignmentId)
                .collect(Collectors.toList());

        Map<Integer, AssignmentSubmission> submissionMap = submissionRepo
                .findByStudentRegNoAndAssignmentIdIn(regNo, assignmentIds)
                .stream()
                .collect(Collectors.toMap(AssignmentSubmission::getAssignmentId, s -> s));

        LocalDateTime now = LocalDateTime.now();

        return assignments.stream().map(a -> {
            AssignmentDTO dto = new AssignmentDTO();
            dto.setAssignmentId(a.getAssignmentId());
            dto.setTitle(a.getTitle());
            dto.setDescription(a.getDescription());
            dto.setDeadline(a.getDeadline());
            dto.setIsOverdue(a.getDeadline() != null && a.getDeadline().isBefore(now));

            Course c = ctx.courseMap.get(a.getCourseId());
            if (c != null) { dto.setCourseCode(c.getCourseCode()); dto.setCourseName(c.getCourseName()); }

            AssignmentSubmission sub = submissionMap.get(a.getAssignmentId());
            if (sub == null) {
                dto.setSubmissionStatus("not_submitted");
            } else {
                dto.setSubmissionStatus("graded".equals(sub.getGradingStatus()) ? "graded" : "submitted");
                dto.setGradingStatus(sub.getGradingStatus());
                dto.setMarksObtained(sub.getMarks());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Attendance
    // ─────────────────────────────────────────────────────────────────────────

    public List<AttendanceDTO> getAttendance(String regNo) {
        StudentContext ctx = buildContext(regNo);
        if (ctx.courseIds.isEmpty()) return Collections.emptyList();
        return buildAttendance(ctx, regNo);
    }

    private List<AttendanceDTO> buildAttendance(StudentContext ctx, String regNo) {
        List<AttendanceSession> allSessions = sessionRepo.findByCourseIdIn(ctx.courseIds);

        Map<Integer, List<AttendanceSession>> sessionsByCourse = allSessions.stream()
                .collect(Collectors.groupingBy(AttendanceSession::getCourseId));

        List<Integer> allSessionIds = allSessions.stream()
                .map(AttendanceSession::getSessionId)
                .collect(Collectors.toList());

        Map<Integer, String> recordMap = allSessionIds.isEmpty()
                ? Collections.emptyMap()
                : recordRepo.findByStudentRegNoAndSessionIdIn(regNo, allSessionIds)
                        .stream()
                        .collect(Collectors.toMap(AttendanceRecord::getSessionId, AttendanceRecord::getStatus));

        return ctx.courseIds.stream()
                .filter(ctx.courseMap::containsKey)
                .map(courseId -> {
                    Course c = ctx.courseMap.get(courseId);
                    List<AttendanceSession> sessions = sessionsByCourse.getOrDefault(courseId, Collections.emptyList());
                    int total    = sessions.size();
                    int attended = (int) sessions.stream()
                            .filter(s -> "Present".equalsIgnoreCase(recordMap.get(s.getSessionId())))
                            .count();
                    double pct = total == 0 ? 0.0
                            : Math.round((attended * 100.0 / total) * 100.0) / 100.0;

                    AttendanceDTO dto = new AttendanceDTO();
                    dto.setCourseId(courseId);
                    dto.setCourseCode(c.getCourseCode());
                    dto.setCourseName(c.getCourseName());
                    dto.setTotalClasses(total);
                    dto.setAttendedClasses(attended);
                    dto.setAttendancePercentage(pct);
                    dto.setIsBelowThreshold(pct < ATTENDANCE_THRESHOLD);
                    return dto;
                }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Timetable — sets periodType from DB (no hardcoded break/lunch times)
    // ─────────────────────────────────────────────────────────────────────────

    public List<TimetableDTO> getTimetable(String regNo) {
        return buildTimetable(buildContext(regNo));
    }

    private List<TimetableDTO> buildTimetable(StudentContext ctx) {
        StudentDetails sd = ctx.student;

        List<Timetable> entries = timetableRepo
                .findByDepartmentAndSectionAndSemesterOrderByDayOfWeekAscPeriodNumberAsc(
                        sd.getDepartment(), sd.getSection(), sd.getSemester());

        // Fetch any timetable courses not in enrollment (e.g. labs, electives)
        List<Integer> ttCourseIds = entries.stream()
                .map(Timetable::getCourseId)
                .distinct()
                .filter(id -> id != null && !ctx.courseMap.containsKey(id))
                .collect(Collectors.toList());

        Map<Integer, Course> fullCourseMap  = new HashMap<>(ctx.courseMap);
        Map<Integer, String> fullFacultyMap = new HashMap<>(ctx.facultyMap);

        if (!ttCourseIds.isEmpty()) {
            courseRepo.findByCourseIdIn(ttCourseIds)
                    .forEach(c -> fullCourseMap.put(c.getCourseId(), c));

            List<CourseFaculty> extra = courseFacultyRepo.findByCourseIdIn(ttCourseIds);
            List<String> extraFacultyIds = extra.stream()
                    .map(CourseFaculty::getFacultyId).distinct().collect(Collectors.toList());
            Map<String, String> extraNames = facultyDetailsRepo.findByFacultyIdIn(extraFacultyIds)
                    .stream()
                    .collect(Collectors.toMap(FacultyDetails::getFacultyId, FacultyDetails::getName));
            extra.forEach(cf -> fullFacultyMap.put(cf.getCourseId(),
                    extraNames.getOrDefault(cf.getFacultyId(), "N/A")));
        }

        return entries.stream().map(t -> {
            TimetableDTO dto = new TimetableDTO();
            dto.setDayOfWeek(t.getDayOfWeek());
            dto.setPeriodNumber(t.getPeriodNumber());
            dto.setPeriodType(t.getPeriodType());   // ← "class" | "break" | "lunch break"
            dto.setStartTime(t.getStartTime() != null ? t.getStartTime().format(TIME_FMT) : "");
            dto.setEndTime(t.getEndTime()   != null ? t.getEndTime().format(TIME_FMT)   : "");
            dto.setClassroom(t.getClassroom());

            Course c = fullCourseMap.get(t.getCourseId());
            if (c != null) { dto.setCourseCode(c.getCourseCode()); dto.setCourseName(c.getCourseName()); }
            dto.setFacultyName(fullFacultyMap.getOrDefault(t.getCourseId(), "N/A"));
            return dto;
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Marks
    // ─────────────────────────────────────────────────────────────────────────

    public List<MarksDTO> getMarks(String regNo) {
        StudentContext ctx = buildContext(regNo);
        if (ctx.courseIds.isEmpty()) return Collections.emptyList();
        return buildMarks(ctx, regNo);
    }

    private List<MarksDTO> buildMarks(StudentContext ctx, String regNo) {
        List<Marks> allMarks = marksRepo.findByStudentRegNoAndCourseIdIn(regNo, ctx.courseIds);
        Map<Integer, List<Marks>> marksByCourse = allMarks.stream()
                .collect(Collectors.groupingBy(Marks::getCourseId));

        return ctx.courseIds.stream()
                .filter(ctx.courseMap::containsKey)
                .map(courseId -> {
                    Course c = ctx.courseMap.get(courseId);
                    MarksDTO dto = new MarksDTO();
                    dto.setCourseId(courseId);
                    dto.setCourseCode(c.getCourseCode());
                    dto.setCourseName(c.getCourseName());
                    dto.setEntries(
                            marksByCourse.getOrDefault(courseId, Collections.emptyList())
                                    .stream()
                                    .map(m -> {
                                        MarksDTO.MarkEntryDTO e = new MarksDTO.MarkEntryDTO();
                                        e.setEvaluationType(m.getEvaluationType());
                                        e.setEvaluationLabel(m.getEvaluationLabel());
                                        e.setMarksObtained(m.getMarksObtained());
                                        e.setMaxMarks(m.getMaxMarks());
                                        e.setPercentage(m.getMaxMarks() == 0 ? 0.0
                                                : Math.round(((double) m.getMarksObtained() / m.getMaxMarks() * 100) * 100.0) / 100.0);
                                        return e;
                                    }).collect(Collectors.toList())
                    );
                    return dto;
                }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Announcements
    // ─────────────────────────────────────────────────────────────────────────

    public List<Announcement> getAnnouncements(String regNo) {
        StudentContext ctx = buildContext(regNo);
        if (ctx.courseIds.isEmpty()) return Collections.emptyList();
        return announcementRepo.findByCourseIdInOrderByCreatedAtDesc(ctx.courseIds);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Quizzes
    // ─────────────────────────────────────────────────────────────────────────

    public List<QuizDTO> getQuizzes(String regNo) {
        StudentContext ctx = buildContext(regNo);
        if (ctx.courseIds.isEmpty()) return Collections.emptyList();
        return buildQuizzes(ctx);
    }

    private List<QuizDTO> buildQuizzes(StudentContext ctx) {
        LocalDateTime now = LocalDateTime.now();
        return quizRepo.findByCourseIdIn(ctx.courseIds).stream().map(q -> {
            QuizDTO dto = new QuizDTO();
            dto.setQuizId(q.getQuizId());
            dto.setTitle(q.getTitle());
            dto.setDeadline(q.getDeadline());
            dto.setTimer(q.getTimer());
            dto.setIsOverdue(q.getDeadline() != null && q.getDeadline().isBefore(now));
            Course c = ctx.courseMap.get(q.getCourseId());
            if (c != null) { dto.setCourseCode(c.getCourseCode()); dto.setCourseName(c.getCourseName()); }
            return dto;
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Notifications
    // ─────────────────────────────────────────────────────────────────────────

    public List<NotificationDTO> getNotifications(String regNo) {
        return notificationRepo.findByRecipientRegNoOrderByCreatedAtDesc(regNo)
                .stream()
                .map(n -> {
                    NotificationDTO dto = new NotificationDTO();
                    dto.setNotificationId(n.getNotificationId());
                    dto.setType(n.getType());
                    dto.setTitle(n.getTitle());
                    dto.setMessage(n.getMessage());
                    dto.setRelatedId(n.getRelatedId());
                    dto.setRelatedType(n.getRelatedType());
                    dto.setIsRead(n.getIsRead());
                    dto.setCreatedAt(n.getCreatedAt());
                    return dto;
                }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. Mark notification as read
    // ─────────────────────────────────────────────────────────────────────────

    public void markNotificationRead(Integer notificationId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepo.save(n);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 11. Unread notification count
    // ─────────────────────────────────────────────────────────────────────────

    public long getUnreadNotificationCount(String regNo) {
        return notificationRepo.countByRecipientRegNoAndIsReadFalse(regNo);
    }
}