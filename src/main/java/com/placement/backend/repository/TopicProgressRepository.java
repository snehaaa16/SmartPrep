package com.placement.backend.repository;

import com.placement.backend.model.TopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> {
    List<TopicProgress> findByUserId(Long userId);
    Optional<TopicProgress> findByUserIdAndTopicId(Long userId, Long topicId);
    boolean existsByUserIdAndTopicId(Long userId, Long topicId);
    int countByUserIdAndTopicRoadmapId(Long userId, Long roadmapId);
    long countByUserId(Long userId);
    
    // Fetch topics completed today
    List<TopicProgress> findByUserIdAndCompletedAtBetween(Long userId, java.util.Date start, java.util.Date end);
}
