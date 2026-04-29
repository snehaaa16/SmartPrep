package com.placement.backend.controller;


import com.placement.backend.model.Roadmap;
import com.placement.backend.model.Subject;
import com.placement.backend.model.Topic;
import com.placement.backend.repository.RoadmapRepository;
import com.placement.backend.repository.SubjectRepository;
import com.placement.backend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
@CrossOrigin(origins = "*")
public class RoadmapController {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private RoadmapRepository roadmapRepository;

    @Autowired
    private TopicRepository topicRepository;

    // 1. Get all available subjects (DSA, Java, OS...)
    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    // 2. Get the predefined roadmap and its topics for a specific subject
    @GetMapping("/{subjectId}/predefined")
    public ResponseEntity<?> getPredefinedRoadmap(@PathVariable Long subjectId) {
        Roadmap roadmap = roadmapRepository.findBySubjectIdAndType(subjectId, Roadmap.RoadmapType.PREDEFINED)
                .orElse(null);

        if (roadmap == null) {
            return ResponseEntity.notFound().build();
        }

        // Fetch all the topics inside this roadmap
        List<Topic> topics = topicRepository.findByRoadmapIdOrderByOrderIndexAsc(roadmap.getId());

        return ResponseEntity.ok(topics);
    }

    // 3. Get topics for a specific roadmap by its ID (used for custom roadmaps)
    @GetMapping("/by-roadmap/{roadmapId}")
    public ResponseEntity<?> getTopicsByRoadmapId(@PathVariable Long roadmapId) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId).orElse(null);
        if (roadmap == null) {
            return ResponseEntity.notFound().build();
        }
        List<Topic> topics = topicRepository.findByRoadmapIdOrderByOrderIndexAsc(roadmapId);
        return ResponseEntity.ok(topics);
    }
}
