package com.placement.backend.controller;

import com.placement.backend.dto.ProgressResponse;
import com.placement.backend.model.User;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 1. Auto-save a roadmap to user's profile
    @PostMapping("/roadmap/{roadmapId}")
    public ResponseEntity<?> saveRoadmap(@PathVariable Long roadmapId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        progressService.saveRoadmapForUser(user, roadmapId);
        return ResponseEntity.ok("Roadmap saved to your paths!");
    }

    // 1.5 Enroll in predefined roadmap by subject
    @PostMapping("/enroll/{subjectId}")
    public ResponseEntity<?> enrollInPredefined(@PathVariable Long subjectId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        progressService.enrollInPredefinedRoadmap(user, subjectId);
        return ResponseEntity.ok("Enrolled in predefined roadmap!");
    }

    // 2. Mark a specific topic as completed
    @PostMapping("/topic/{topicId}")
    public ResponseEntity<?> markTopicCompleted(@PathVariable Long topicId, @RequestParam(defaultValue = "false") boolean earnedXp, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        progressService.markTopicAsCompleted(user, topicId, earnedXp);
        return ResponseEntity.ok("Topic marked as completed!");
    }

    // 3. Get all saved roadmaps with progress percentage
    @GetMapping("/saved-roadmaps")
    public ResponseEntity<List<ProgressResponse>> getSavedRoadmaps(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<ProgressResponse> savedRoadmaps = progressService.getSavedRoadmapsWithProgress(user);
        return ResponseEntity.ok(savedRoadmaps);
    }

    // 4. Get list of completed topic IDs for a specific roadmap
    @GetMapping("/completed-topics/{roadmapId}")
    public ResponseEntity<List<Long>> getCompletedTopics(@PathVariable Long roadmapId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Long> completedIds = progressService.getCompletedTopicIds(user, roadmapId);
        return ResponseEntity.ok(completedIds);
    }

    // 5. Get Daily Review (Summary & Flashcards)
    @GetMapping("/daily-review")
    public ResponseEntity<com.placement.backend.dto.DailyReviewResponse> getDailyReview(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        com.placement.backend.dto.DailyReviewResponse response = progressService.getDailyReview(user);
        return ResponseEntity.ok(response);
    }

    // 6. Delete a saved roadmap
    @DeleteMapping("/saved-roadmaps/{roadmapId}")
    public ResponseEntity<?> deleteSavedRoadmap(@PathVariable Long roadmapId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        progressService.deleteSavedRoadmap(user, roadmapId);
        return ResponseEntity.ok("Saved roadmap deleted successfully.");
    }
}
