package com.placement.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts a notification to all connected users.
     */
    public void broadcastNotification(String title, String message, String type) {
        Map<String, String> payload = Map.of(
            "title", title,
            "message", message,
            "type", type
        );
        messagingTemplate.convertAndSend("/topic/notifications", payload);
    }
    
    public void announceLiveQuiz() {
        broadcastNotification("🚨 Live Quiz Started!", "Join the daily 8 PM challenge now to earn double XP!", "QUIZ_START");
    }

    /**
     * Broadcasts a live question or game state to the quiz room.
     */
    public void broadcastLiveQuestion(Object data) {
        messagingTemplate.convertAndSend("/topic/live-quiz/stream", data);
    }
}
