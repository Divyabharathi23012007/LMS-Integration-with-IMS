package com.lms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.dto.QuizQuestionDTO;
import com.lms.dto.QuizResultDTO;
import com.lms.dto.QuizStartResponseDTO;
import com.lms.dto.QuizSubmitRequestDTO;
import com.lms.model.Marks;
import com.lms.model.Quiz;
import com.lms.model.QuizQuestion;
import com.lms.model.QuizResponse;
import com.lms.model.QuizSubmission;
import com.lms.repository.MarksRepository;
import com.lms.repository.QuizQuestionRepository;
import com.lms.repository.QuizRepository;
import com.lms.repository.QuizResponseRepository;
import com.lms.repository.QuizSubmissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository           quizRepo;
    private final QuizQuestionRepository   questionRepo;
    private final QuizSubmissionRepository submissionRepo;
    private final QuizResponseRepository   responseRepo;
    private final MarksRepository          marksRepo;

    // ── Start quiz — creates submission row, returns questions (no correct_option) ──
    @Transactional
    public QuizStartResponseDTO startQuiz(Integer quizId, String regNo) {
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        // Block if deadline passed
        if (quiz.getDeadline() != null && quiz.getDeadline().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Quiz deadline has passed.");

        // Block if already submitted
        submissionRepo.findByQuizIdAndStudentRegNo(quizId, regNo).ifPresent(s -> {
            if (Boolean.TRUE.equals(s.getIsSubmitted()))
                throw new RuntimeException("You have already submitted this quiz.");
        });

        // Create or resume submission
        QuizSubmission sub = submissionRepo
                .findByQuizIdAndStudentRegNo(quizId, regNo)
                .orElseGet(() -> {
                    QuizSubmission s = new QuizSubmission();
                    s.setQuizId(quizId);
                    s.setStudentRegNo(regNo);
                    s.setStartedAt(LocalDateTime.now());
                    s.setIsSubmitted(false);
                    return submissionRepo.save(s);
                });

        // Fetch questions — map to DTO, correctOption deliberately excluded
        List<QuizQuestionDTO> questions = questionRepo.findByQuizId(quizId)
                .stream()
                .map(this::toQuestionDTO)
                .collect(Collectors.toList());

        QuizStartResponseDTO resp = new QuizStartResponseDTO();
        resp.setSubmissionId(sub.getSubmissionId());
        resp.setQuizId(quizId);
        resp.setTitle(quiz.getTitle());
        resp.setTimer(quiz.getTimer());
        resp.setQuestions(questions);
        return resp;
    }

    // ── Submit quiz — grade server-side, save results ──────────────────────────
    @Transactional
    public QuizResultDTO submitQuiz(Integer submissionId, QuizSubmitRequestDTO request) {
        QuizSubmission sub = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        if (Boolean.TRUE.equals(sub.getIsSubmitted()))
            throw new RuntimeException("Quiz already submitted.");

        Quiz quiz = quizRepo.findById(sub.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + sub.getQuizId()));

        // Load all questions for this quiz (with correct answers — server only)
        List<QuizQuestion> questions = questionRepo.findByQuizId(sub.getQuizId());
        Map<Integer, QuizQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(QuizQuestion::getQuestionId, q -> q));

        // Delete previous partial responses (e.g. from auto-save)
        responseRepo.deleteBySubmissionId(submissionId);

        double totalMarks   = 0.0;
        double obtainedMarks = 0.0;

        for (QuizSubmitRequestDTO.ResponseItem item : request.getResponses()) {
            QuizQuestion q = questionMap.get(item.getQuestionId());
            if (q == null) continue;

            double qMarks   = (q.getMarks() != null) ? q.getMarks().doubleValue() : 0.0;
            totalMarks     += qMarks;

            boolean correct = item.getSelectedOption() != null
                    && item.getSelectedOption().equalsIgnoreCase(q.getCorrectOption());

            double awarded = correct ? qMarks : 0.0;
            obtainedMarks += awarded;

            QuizResponse resp = new QuizResponse();
            resp.setSubmissionId(submissionId);
            resp.setQuestionId(item.getQuestionId());
            resp.setSelectedOption(item.getSelectedOption());
            resp.setIsCorrect(correct);
            resp.setMarksAwarded(awarded);
            responseRepo.save(resp);
        }

        double percentage = totalMarks > 0
                ? Math.round((obtainedMarks / totalMarks * 100) * 100.0) / 100.0
                : 0.0;

        sub.setIsSubmitted(true);
        sub.setSubmittedAt(LocalDateTime.now());
        sub.setTotalMarks(totalMarks);
        sub.setObtainedMarks(obtainedMarks);
        sub.setPercentage(percentage);
        submissionRepo.save(sub);

        Marks mark = marksRepo
                .findByStudentRegNoAndCourseIdAndEvaluationTypeAndEvaluationLabel(
                        sub.getStudentRegNo(), quiz.getCourseId(), "Quiz", quiz.getTitle())
                .orElseGet(Marks::new);
        mark.setStudentRegNo(sub.getStudentRegNo());
        mark.setCourseId(quiz.getCourseId());
        mark.setEvaluationType("Quiz");
        mark.setEvaluationLabel(quiz.getTitle());
        mark.setMarksObtained(obtainedMarks);
        mark.setMaxMarks(totalMarks);
        mark.setRecordedBy("system");
        mark.setRecordedAt(LocalDateTime.now());
        marksRepo.save(mark);

        QuizResultDTO result = new QuizResultDTO();
        result.setSubmissionId(submissionId);
        result.setShowResult(sub.getShowResult());
        result.setTotalMarks(totalMarks);
        result.setObtainedMarks(obtainedMarks);
        result.setPercentage(percentage);
        return result;
    }

    // ── Get all submissions for a student ─────────────────────────────────────
    public List<QuizSubmission> getSubmissionsForStudent(String regNo) {
        return submissionRepo.findByStudentRegNo(regNo);
    }

    // ── Question DTO — correctOption never included ────────────────────────────
    private QuizQuestionDTO toQuestionDTO(QuizQuestion q) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setQuestionId(q.getQuestionId());
        dto.setQuizId(q.getQuizId());
        dto.setQuestionText(q.getQuestionText());
        dto.setOptionA(q.getOptionA());
        dto.setOptionB(q.getOptionB());
        dto.setOptionC(q.getOptionC());
        dto.setOptionD(q.getOptionD());
        dto.setMarks(q.getMarks());
        // correctOption intentionally NOT set
        return dto;
    }
}