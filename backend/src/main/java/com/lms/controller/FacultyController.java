package com.lms.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lms.model.AblActivity;
import com.lms.model.AblSubmission;
import com.lms.model.Assignment;
import com.lms.model.AssignmentSubmission;
import com.lms.model.Course;
import com.lms.model.Marks;
import com.lms.model.Quiz;
import com.lms.model.StudyMaterial;
import com.lms.service.FacultyService;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getCourses(@RequestHeader("X-User-RegNo") String facultyId) {
        List<Course> courses = facultyService.getCoursesForFaculty(facultyId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/assignments")
    public ResponseEntity<Assignment> createAssignment(
            @RequestHeader("X-User-RegNo") String facultyId,
            @RequestParam("courseId") Integer courseId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "questionFile", required = false) MultipartFile questionFile) {
        Assignment assignment = facultyService.createAssignment(facultyId, courseId, title, description, deadline, questionFile);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(@RequestHeader("X-User-RegNo") String facultyId) {
        List<Assignment> assignments = facultyService.getAssignmentsForFaculty(facultyId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(@RequestHeader("X-User-RegNo") String facultyId, @PathVariable Integer assignmentId) {
        List<AssignmentSubmission> submissions = facultyService.getSubmissionsForAssignment(facultyId, assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<AssignmentSubmission> gradeSubmission(
            @RequestHeader("X-User-RegNo") String facultyId,
            @PathVariable Integer submissionId,
            @RequestBody Map<String, Object> body) {
        Integer marks = (Integer) body.get("marks");
        String feedback = (String) body.get("feedback");
        AssignmentSubmission submission = facultyService.gradeSubmission(facultyId, submissionId, marks, feedback);
        return ResponseEntity.ok(submission);
    }

    @PostMapping("/abl")
    public ResponseEntity<AblActivity> createAblActivity(
            @RequestHeader("X-User-RegNo") String facultyId,
            @RequestParam("courseId") Integer courseId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "activityFile", required = false) MultipartFile activityFile,
            @RequestParam(value = "activityLink", required = false) String activityLink) {
        AblActivity activity = facultyService.createAblActivity(facultyId, courseId, title, description, deadline, activityFile, activityLink);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/abl")
    public ResponseEntity<List<AblActivity>> getAblActivities(@RequestHeader("X-User-RegNo") String facultyId) {
        List<AblActivity> activities = facultyService.getAblActivitiesForFaculty(facultyId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/abl/{activityId}/submissions")
    public ResponseEntity<List<AblSubmission>> getAblSubmissions(@RequestHeader("X-User-RegNo") String facultyId, @PathVariable Integer activityId) {
        List<AblSubmission> submissions = facultyService.getAblSubmissionsForActivity(facultyId, activityId);
        return ResponseEntity.ok(submissions);
    }

    @PutMapping("/abl/submissions/{submissionId}/grade")
    public ResponseEntity<AblSubmission> gradeAblSubmission(
            @RequestHeader("X-User-RegNo") String facultyId,
            @PathVariable Integer submissionId,
            @RequestBody Map<String, Object> body) {
        Integer marks = (Integer) body.get("marks");
        String feedback = (String) body.get("feedback");
        AblSubmission submission = facultyService.gradeAblSubmission(facultyId, submissionId, marks, feedback);
        return ResponseEntity.ok(submission);
    }

    @PostMapping("/quizzes")
    public ResponseEntity<Quiz> createQuiz(
            @RequestHeader("X-User-RegNo") String facultyId,
            @RequestParam("courseId") Integer courseId,
            @RequestParam("title") String title,
            @RequestParam("deadline") String deadline,
            @RequestParam("timer") Integer timer) {
        Quiz quiz = facultyService.createQuiz(facultyId, courseId, title, deadline, timer);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzes(@RequestHeader("X-User-RegNo") String facultyId) {
        List<Quiz> quizzes = facultyService.getQuizzesForFaculty(facultyId);
        return ResponseEntity.ok(quizzes);
    }

    @PostMapping("/materials")
    public ResponseEntity<StudyMaterial> uploadMaterial(
            @RequestHeader("X-User-RegNo") String facultyId,
            @RequestParam("courseId") Integer courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "videoLink", required = false) String videoLink) {
        StudyMaterial material = facultyService.uploadMaterial(facultyId, courseId, title, file, videoLink);
        return ResponseEntity.ok(material);
    }

    @GetMapping("/materials")
    public ResponseEntity<List<StudyMaterial>> getMaterials(@RequestHeader("X-User-RegNo") String facultyId) {
        List<StudyMaterial> materials = facultyService.getMaterialsForFaculty(facultyId);
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/marks")
    public ResponseEntity<Marks> enterMarks(
            @RequestHeader("X-User-RegNo") String facultyId,
            @RequestBody Map<String, Object> body) {
        Integer courseId = (Integer) body.get("courseId");
        String studentRegNo = (String) body.get("studentRegNo");
        String evaluationType = (String) body.get("evaluationType");
        Double marksObtained = Double.valueOf((Integer) body.get("marksObtained"));
        Double maxMarks = Double.valueOf((Integer) body.get("maxMarks"));
        Marks marks = facultyService.enterMarks(facultyId, courseId, studentRegNo, evaluationType, marksObtained, maxMarks);
        return ResponseEntity.ok(marks);
    }
}