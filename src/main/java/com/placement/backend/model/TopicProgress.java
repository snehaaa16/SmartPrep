package com.placement.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "topic_progress")
public class TopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Temporal(TemporalType.TIMESTAMP)
    private Date completedAt;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean xpAwarded = false;

    @PrePersist
    protected void onCreate() {
        completedAt = new Date();
    }
}
