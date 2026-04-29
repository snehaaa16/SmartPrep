package com.placement.backend.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "roadmaps")
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // Many roadmaps can belong to one subject
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne // Many custom roadmaps can belong to one user
    @JoinColumn(name = "user_id") // Nullable because Predefined roadmaps don't belong to a specific user
    private User user;

    @Enumerated(EnumType.STRING)
    private RoadmapType type; // PREDEFINED or CUSTOM

    public enum RoadmapType {
        PREDEFINED, CUSTOM
    }
}
