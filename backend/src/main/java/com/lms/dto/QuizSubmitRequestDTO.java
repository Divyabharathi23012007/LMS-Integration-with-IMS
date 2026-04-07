package com.lms.dto;

import java.util.List;

import lombok.Data;

@Data
public class QuizSubmitRequestDTO {

    private List<ResponseItem> responses;

    @Data
    public static class ResponseItem {
        private Integer questionId;
        private String  selectedOption;   // "A"|"B"|"C"|"D" or null
    }
}