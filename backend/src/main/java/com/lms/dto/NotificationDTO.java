package com.lms.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationDTO {
    private Integer notificationId;
    private String type;
    private String title;
    private String message;
    private Integer relatedId;
    private String relatedType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}