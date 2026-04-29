package com.placement.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String theoryContent; // The AI-summarized notes will go here

    private String videoUrl; // Curated YouTube link

    @Column(columnDefinition = "TEXT")
    private String codingQuestions; // Links to practice problems

    private int orderIndex; // 1, 2, 3... to keep topics in the right sequence
}

