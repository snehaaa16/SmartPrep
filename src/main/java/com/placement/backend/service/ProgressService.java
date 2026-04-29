package com.placement.backend.service;

import com.placement.backend.dto.ProgressResponse;
import com.placement.backend.model.*;
import com.placement.backend.repository.*;
import com.placement.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SavedRoadmapRepository savedRoadmapRepository;

    @Autowired
    private TopicProgressRepository topicProgressRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private RoadmapRepository roadmapRepository;

    public void saveRoadmapForUser(User user, Long roadmapId) {
        if (!savedRoadmapRepository.existsByUserIdAndRoadmapId(user.getId(), roadmapId)) {
            Roadmap roadmap = roadmapRepository.findById(roadmapId)
                    .orElseThrow(() -> new RuntimeException("Roadmap not found"));
            SavedRoadmap savedRoadmap = new SavedRoadmap();
            savedRoadmap.setUser(user);
            savedRoadmap.setRoadmap(roadmap);
            savedRoadmapRepository.save(savedRoadmap);
        }
    }

    public void enrollInPredefinedRoadmap(User user, Long subjectId) {
        Roadmap roadmap = roadmapRepository.findBySubjectIdAndType(subjectId, Roadmap.RoadmapType.PREDEFINED)
                .orElseThrow(() -> new RuntimeException("Predefined roadmap not found for subject"));
        saveRoadmapForUser(user, roadmap.getId());
    }

    public void markTopicAsCompleted(User user, Long topicId, boolean earnedXp) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        
        TopicProgress progress = topicProgressRepository.findByUserIdAndTopicId(user.getId(), topicId)
                .orElse(null);

        boolean isNewCompletion = false;

        if (progress == null) {
            progress = new TopicProgress();
            progress.setUser(user);
            progress.setTopic(topic);
            isNewCompletion = true;
        }

        // Only update streak if it's a new completion to prevent gaming the streak
        if (isNewCompletion) {
            // Streak and Gamification Logic
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
            cal.set(java.util.Calendar.MINUTE, 0);
            cal.set(java.util.Calendar.SECOND, 0);
            cal.set(java.util.Calendar.MILLISECOND, 0);
            java.util.Date todayMidnight = cal.getTime();

            java.util.Date lastActive = user.getLastActiveDate();

            if (lastActive != null) {
                java.util.Calendar lastActiveCal = java.util.Calendar.getInstance();
                lastActiveCal.setTime(lastActive);
                lastActiveCal.set(java.util.Calendar.HOUR_OF_DAY, 0);
                lastActiveCal.set(java.util.Calendar.MINUTE, 0);
                lastActiveCal.set(java.util.Calendar.SECOND, 0);
                lastActiveCal.set(java.util.Calendar.MILLISECOND, 0);
                java.util.Date lastActiveMidnight = lastActiveCal.getTime();

                long diffInMillies = Math.abs(todayMidnight.getTime() - lastActiveMidnight.getTime());
                long diffInDays = java.util.concurrent.TimeUnit.DAYS.convert(diffInMillies, java.util.concurrent.TimeUnit.MILLISECONDS);

                if (diffInDays == 1) {
                    user.setCurrentStreak(user.getCurrentStreak() + 1);
                } else if (diffInDays > 1) {
                    user.setCurrentStreak(1);
                }
            } else {
                user.setCurrentStreak(1);
            }

            if (user.getCurrentStreak() > user.getHighestStreak()) {
                user.setHighestStreak(user.getCurrentStreak());
            }

            user.setLastActiveDate(new java.util.Date());
            // Auto-save the roadmap if not already saved!
            saveRoadmapForUser(user, topic.getRoadmap().getId());
        }

        if (earnedXp && !progress.isXpAwarded()) {
            user.setPoints(user.getPoints() + 10);
            progress.setXpAwarded(true);
        }

        topicProgressRepository.save(progress);
        userRepository.save(user);
    }

    public List<ProgressResponse> getSavedRoadmapsWithProgress(User user) {
        List<SavedRoadmap> savedRoadmaps = savedRoadmapRepository.findByUserId(user.getId());
        List<ProgressResponse> responseList = new ArrayList<>();
        
        // Deduplicate in case race conditions inserted multiple of the same roadmap
        java.util.Set<Long> seenRoadmapIds = new java.util.HashSet<>();

        for (SavedRoadmap saved : savedRoadmaps) {
            Roadmap roadmap = saved.getRoadmap();
            if (seenRoadmapIds.contains(roadmap.getId())) continue;
            seenRoadmapIds.add(roadmap.getId());
            
            int totalTopics = topicRepository.countByRoadmapId(roadmap.getId());
            int completedTopics = topicProgressRepository.countByUserIdAndTopicRoadmapId(user.getId(), roadmap.getId());
            
            int percentage = totalTopics == 0 ? 0 : (int) (((double) completedTopics / totalTopics) * 100);
            
            responseList.add(new ProgressResponse(roadmap, completedTopics, totalTopics, percentage));
        }

        return responseList;
    }

    public List<Long> getCompletedTopicIds(User user, Long roadmapId) {
        return topicProgressRepository.findByUserId(user.getId())
                .stream()
                .filter(p -> p.getTopic().getRoadmap().getId().equals(roadmapId))
                .map(p -> p.getTopic().getId())
                .collect(Collectors.toList());
    }

    public void deleteSavedRoadmap(User user, Long roadmapId) {
        SavedRoadmap savedRoadmap = savedRoadmapRepository.findByUserId(user.getId())
                .stream()
                .filter(s -> s.getRoadmap().getId().equals(roadmapId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Saved roadmap not found"));
        savedRoadmapRepository.delete(savedRoadmap);
    }

    @Autowired
    private AiService aiService;

    public com.placement.backend.dto.DailyReviewResponse getDailyReview(User user) {
        // Find start and end of today
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        java.util.Date startOfDay = cal.getTime();

        cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
        cal.set(java.util.Calendar.MINUTE, 59);
        cal.set(java.util.Calendar.SECOND, 59);
        java.util.Date endOfDay = cal.getTime();

        List<TopicProgress> todayProgress = topicProgressRepository.findByUserIdAndCompletedAtBetween(user.getId(), startOfDay, endOfDay);
        
        if (todayProgress.isEmpty()) {
            return new com.placement.backend.dto.DailyReviewResponse(0, null, null);
        }

        StringBuilder theoryBuilder = new StringBuilder();
        for (TopicProgress tp : todayProgress) {
            theoryBuilder.append("Topic: ").append(tp.getTopic().getTitle()).append("\n");
            theoryBuilder.append(tp.getTopic().getTheoryContent()).append("\n\n");
        }
        
        String combinedTheory = theoryBuilder.toString();
        
        // Let's cap the theory content to ~10,000 characters to ensure we don't exceed token limits unnecessarily
        if (combinedTheory.length() > 10000) {
            combinedTheory = combinedTheory.substring(0, 10000);
        }

        String summary = aiService.generateDailySummary(combinedTheory);
        String flashcardsJson = aiService.generateFlashcards(combinedTheory);

        return new com.placement.backend.dto.DailyReviewResponse(todayProgress.size(), summary, flashcardsJson);
    }
    public void rewardXp(String email, int amount) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPoints(user.getPoints() + amount);
            userRepository.save(user);
        });
    }
}
