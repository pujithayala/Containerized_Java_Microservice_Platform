package com.platform.notificationservice.exception;

public class NotificationNotFoundException extends RuntimeException {

    public NotificationNotFoundException(Long id) {
        super("Notification not found with id: " + id);
    }

    public NotificationNotFoundException(String message) {
        super(message);
    }
}
