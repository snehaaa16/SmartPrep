package com.placement.backend.scheduler;

import com.placement.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LiveQuizScheduler {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.placement.backend.controller.AiController aiController;

    // Cron expression: "0 0 20 * * *" means "at 20:00:00 (8 PM) every day"
    @Scheduled(cron = "0 0 20 * * *")
    public void startLiveQuiz() {
        System.out.println("Scheduler triggered: Starting Daily Live Quiz!");
        notificationService.announceLiveQuiz();
        // Automatically start the AI game loop
        aiController.startAiLiveQuiz();
    }

    // Reminder at 7:55 PM
    @Scheduled(cron = "0 55 19 * * *")
    public void remindLiveQuiz() {
        notificationService.broadcastNotification("⏰ 5 Minutes to Go!", "Daily Live Quiz will start at 8:00 PM sharp. Get ready!", "REMINDER");
    }
}
