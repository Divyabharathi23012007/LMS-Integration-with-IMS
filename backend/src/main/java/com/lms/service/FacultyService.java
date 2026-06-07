package com.lms.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lms.model.AblActivity;
import com.lms.model.AblSubmission;
import com.lms.model.Assignment;
import com.lms.model.AssignmentSubmission;
import com.lms.model.Course;
import com.lms.model.CourseFaculty;
import com.lms.model.Marks;
import com.lms.model.Quiz;
import com.lms.model.StudyMaterial;
import com.lms.repository.AblActivityRepository;
import com.lms.repository.AblSubmissionRepository;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.AssignmentSubmissionRepository;
import com.lms.repository.CourseFacultyRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.MarksRepository;
import com.lms.repository.QuizRepository;
import com.lms.repository.StudyMaterialRepository;

@Service
public class FacultyService {

    @Autowired
    private CourseFacultyRepository courseFacultyRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository assignmentSubmissionRepository;

    @Autowired
    private AblActivityRepository ablActivityRepository;

    @Autowired
    private AblSubmissionRepository ablSubmissionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private MarksRepository marksRepository;

    public List<Course> getCoursesForFaculty(String facultyId) {
        List<CourseFaculty> courseFaculties = courseFacultyRepository.findByFacultyId(facultyId);
        List<Integer> courseIds = courseFaculties.stream()
            .map(CourseFaculty::getCourseId)
            .collect(Collectors.toList());
        return courseRepository.findAllById(courseIds);
    }

    public Assignment createAssignment(String facultyId, Integer courseId, String title, String description, String deadlineStr, MultipartFile questionFile) throws RuntimeException {
        // Check if faculty is assigned to the course
        List<CourseFaculty> courseFaculties = courseFacultyRepository.findByFacultyId(facultyId);
        boolean isAssigned = courseFaculties.stream().anyMatch(cf -> cf.getCourseId().equals(courseId));
        if (!isAssigned) {
            throw new RuntimeException("Faculty not assigned to this course");
        }

        Assignment assignment = new Assignment();
        assignment.setCourseId(courseId);
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setCreatedBy(facultyId);

        if (deadlineStr != null && !deadlineStr.isEmpty()) {
            LocalDateTime deadline = LocalDateTime.parse(deadlineStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            assignment.setDeadline(deadline);
        }

        if (questionFile != null && !questionFile.isEmpty()) {
            try {
                assignment.setQuestionFile(questionFile.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file");
            }
        }

        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsForFaculty(String facultyId) {
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        return assignmentRepository.findByCourseIdIn(courseIds);
    }

    public List<AssignmentSubmission> getSubmissionsForAssignment(String facultyId, Integer assignmentId) {
        // Check if assignment belongs to faculty's course
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow(() -> new RuntimeException("Assignment not found"));
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        if (!courseIds.contains(assignment.getCourseId())) {
            throw new RuntimeException("Unauthorized");
        }
        return assignmentSubmissionRepository.findByAssignmentId(assignmentId);
    }

    public AssignmentSubmission gradeSubmission(String facultyId, Integer submissionId, Integer marks, String feedback) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId).orElseThrow(() -> new RuntimeException("Submission not found"));
        // Check authorization
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElseThrow();
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        if (!courseIds.contains(assignment.getCourseId())) {
            throw new RuntimeException("Unauthorized");
        }
        submission.setMarks(marks.doubleValue());
        submission.setFeedback(feedback);
        submission.setGradingStatus("Graded");
        return assignmentSubmissionRepository.save(submission);
    }

    public AblActivity createAblActivity(String facultyId, Integer courseId, String title, String description, String deadlineStr, MultipartFile activityFile, String activityLink) {
        // Check if faculty is assigned
        List<CourseFaculty> courseFaculties = courseFacultyRepository.findByFacultyId(facultyId);
        boolean isAssigned = courseFaculties.stream().anyMatch(cf -> cf.getCourseId().equals(courseId));
        if (!isAssigned) {
            throw new RuntimeException("Faculty not assigned to this course");
        }

        AblActivity activity = new AblActivity();
        activity.setCourseId(courseId);
        activity.setTitle(title);
        activity.setDescription(description);
        activity.setCreatedBy(facultyId);

        if (deadlineStr != null && !deadlineStr.isEmpty()) {
            LocalDateTime deadline = LocalDateTime.parse(deadlineStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            activity.setDeadline(deadline);
        }

        if (activityFile != null && !activityFile.isEmpty()) {
            try {
                activity.setActivityFile(activityFile.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file");
            }
        }

        activity.setActivityLink(activityLink);

        return ablActivityRepository.save(activity);
    }

    public List<AblActivity> getAblActivitiesForFaculty(String facultyId) {
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        return ablActivityRepository.findByCourseIdIn(courseIds);
    }

    public List<AblSubmission> getAblSubmissionsForActivity(String facultyId, Integer activityId) {
        AblActivity activity = ablActivityRepository.findById(activityId).orElseThrow(() -> new RuntimeException("Activity not found"));
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        if (!courseIds.contains(activity.getCourseId())) {
            throw new RuntimeException("Unauthorized");
        }
        return ablSubmissionRepository.findByAblId(activityId);
    }

    public AblSubmission gradeAblSubmission(String facultyId, Integer submissionId, Integer marks, String feedback) {
        AblSubmission submission = ablSubmissionRepository.findById(submissionId).orElseThrow(() -> new RuntimeException("Submission not found"));
        AblActivity activity = ablActivityRepository.findById(submission.getAblId()).orElseThrow();
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        if (!courseIds.contains(activity.getCourseId())) {
            throw new RuntimeException("Unauthorized");
        }
        submission.setMarks(marks.doubleValue());
        submission.setFeedback(feedback);
        submission.setGradingStatus("Graded");
        return ablSubmissionRepository.save(submission);
    }

    public Quiz createQuiz(String facultyId, Integer courseId, String title, String deadlineStr, Integer timer) {
        List<CourseFaculty> courseFaculties = courseFacultyRepository.findByFacultyId(facultyId);
        boolean isAssigned = courseFaculties.stream().anyMatch(cf -> cf.getCourseId().equals(courseId));
        if (!isAssigned) {
            throw new RuntimeException("Faculty not assigned to this course");
        }

        Quiz quiz = new Quiz();
        quiz.setCourseId(courseId);
        quiz.setTitle(title);
        quiz.setCreatedBy(facultyId);
        quiz.setTimer(timer);

        if (deadlineStr != null && !deadlineStr.isEmpty()) {
            LocalDateTime deadline = LocalDateTime.parse(deadlineStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            quiz.setDeadline(deadline);
        }

        return quizRepository.save(quiz);
    }

    public StudyMaterial uploadMaterial(String facultyId, Integer courseId, String title, MultipartFile file, String videoLink) {
        List<CourseFaculty> courseFaculties = courseFacultyRepository.findByFacultyId(facultyId);
        boolean isAssigned = courseFaculties.stream().anyMatch(cf -> cf.getCourseId().equals(courseId));
        if (!isAssigned) {
            throw new RuntimeException("Faculty not assigned to this course");
        }

        StudyMaterial material = new StudyMaterial();
        material.setCourseId(courseId);
        material.setTitle(title);
        material.setUploadedBy(facultyId);

        if (file != null && !file.isEmpty()) {
            try {
                material.setFileData(file.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file");
            }
        }

        material.setVideoLink(videoLink);

        return studyMaterialRepository.save(material);
    }

    public Marks enterMarks(String facultyId, Integer courseId, String studentRegNo, String evaluationType, Double marksObtained, Double maxMarks) {
        List<CourseFaculty> courseFaculties = courseFacultyRepository.findByFacultyId(facultyId);
        boolean isAssigned = courseFaculties.stream().anyMatch(cf -> cf.getCourseId().equals(courseId));
        if (!isAssigned) {
            throw new RuntimeException("Faculty not assigned to this course");
        }

        Marks marks = new Marks();
        marks.setCourseId(courseId);
        marks.setStudentRegNo(studentRegNo);
        marks.setEvaluationType(evaluationType);
        marks.setMarksObtained(marksObtained);
        marks.setMaxMarks(maxMarks);

        return marksRepository.save(marks);
    }

    public List<StudyMaterial> getMaterialsForFaculty(String facultyId) {
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        return studyMaterialRepository.findByCourseIdIn(courseIds);
    }

    public List<Quiz> getQuizzesForFaculty(String facultyId) {
        List<Integer> courseIds = getCoursesForFaculty(facultyId).stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
        return quizRepository.findByCourseIdIn(courseIds);
    }
}