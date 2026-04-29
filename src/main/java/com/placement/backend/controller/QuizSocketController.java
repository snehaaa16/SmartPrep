package com.placement.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Controller
public class QuizSocketController {

    // Key: Email, Value: Current Quiz Score
    public static final Map<String, Integer> activeQuizScores = new ConcurrentHashMap<>();

    @MessageMapping("/quiz.updateScore")
    public void updateScore(@Payload Map<String, Object> payload) {
        String email = (String) payload.get("email");
        Integer points = (Integer) payload.get("points");
        if (email != null && points != null) {
            activeQuizScores.put(email, points);
            System.out.println("DEBUG: Updated score for " + email + " to " + points);
        }
    }
    
    public static void clearScores() {
        activeQuizScores.clear();
    }
}
