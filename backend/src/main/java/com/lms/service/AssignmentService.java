package com.lms.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lms.model.Assignment;
import com.lms.model.AssignmentSubmission;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.AssignmentSubmissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository           assignmentRepo;
    private final AssignmentSubmissionRepository submissionRepo;

    // ── Get question file bytes ───────────────────────────────────────────────
    public byte[] getQuestionFile(Integer assignmentId) {
        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        if (a.getQuestionFile() == null || a.getQuestionFile().length == 0)
            throw new RuntimeException("No question file for this assignment");
        return a.getQuestionFile();
    }

    // ── Submit assignment ─────────────────────────────────────────────────────
    public void submitAssignment(Integer assignmentId, String regNo, MultipartFile file) {
        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        if (a.getDeadline() != null && a.getDeadline().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Deadline has passed. Submission is closed.");

        try {
            // Upsert — allow resubmission before deadline
            Optional<AssignmentSubmission> existing =
                    submissionRepo.findByAssignmentIdAndStudentRegNo(assignmentId, regNo);

            AssignmentSubmission sub = existing.orElseGet(AssignmentSubmission::new);
            sub.setAssignmentId(assignmentId);
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

    // ── Get submission file bytes ─────────────────────────────────────────────
    public byte[] getSubmissionFile(Integer submissionId) {
        AssignmentSubmission sub = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));
        if (sub.getSubmissionFile() == null || sub.getSubmissionFile().length == 0)
            throw new RuntimeException("No file for this submission");
        return sub.getSubmissionFile();
    }
}