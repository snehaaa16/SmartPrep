package com.placement.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "saved_roadmaps")
public class SavedRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Temporal(TemporalType.TIMESTAMP)
    private Date savedAt;

    @PrePersist
    protected void onCreate() {
        savedAt = new Date();
    }
}
