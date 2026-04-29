package com.placement.backend.repository;

import com.placement.backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    // Fetches all topics for a roadmap, ordered by their index (1, 2, 3...)
    List<Topic> findByRoadmapIdOrderByOrderIndexAsc(Long roadmapId);
    
    int countByRoadmapId(Long roadmapId);
}
