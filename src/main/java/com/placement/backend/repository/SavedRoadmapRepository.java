package com.placement.backend.repository;

import com.placement.backend.model.SavedRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedRoadmapRepository extends JpaRepository<SavedRoadmap, Long> {
    List<SavedRoadmap> findByUserId(Long userId);
    Optional<SavedRoadmap> findByUserIdAndRoadmapId(Long userId, Long roadmapId);
    boolean existsByUserIdAndRoadmapId(Long userId, Long roadmapId);
}
