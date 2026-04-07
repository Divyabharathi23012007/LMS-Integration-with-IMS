package com.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientRegNoOrderByCreatedAtDesc(String recipientRegNo);
    List<Notification> findByRecipientRegNoAndIsReadFalse(String recipientRegNo);
    long countByRecipientRegNoAndIsReadFalse(String recipientRegNo);
}