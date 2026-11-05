package com.platform.notificationservice.service;

import com.platform.notificationservice.dto.CreateNotificationRequest;
import com.platform.notificationservice.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(CreateNotificationRequest request);

    NotificationResponse getNotification(Long id);

    List<NotificationResponse> getNotificationsByUser(Long userId);

    List<NotificationResponse> getAllNotifications();

    NotificationResponse markAsRead(Long id);

    List<NotificationResponse> markAllAsRead(Long userId);

    long getUnreadCount();

    long getTotalCount();

    void deleteNotification(Long id);
}
