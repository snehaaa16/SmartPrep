package com.placement.backend.repository;

import com.placement.backend.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    // Finds the default (predefined) roadmap for a specific subject
    Optional<Roadmap> findBySubjectIdAndType(Long subjectId, Roadmap.RoadmapType type);
}
