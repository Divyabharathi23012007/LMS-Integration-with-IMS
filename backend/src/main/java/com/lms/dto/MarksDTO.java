package com.lms.dto;

import java.util.List;

import lombok.Data;

@Data
public class MarksDTO {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private List<MarkEntryDTO> entries;

    @Data
    public static class MarkEntryDTO {
        private String evaluationType;
        private String evaluationLabel;
        private Double marksObtained;
        private Double maxMarks;
        private Double percentage;
    }
}