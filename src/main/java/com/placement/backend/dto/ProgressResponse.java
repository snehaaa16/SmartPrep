package com.placement.backend.dto;

import com.placement.backend.model.Roadmap;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProgressResponse {
    private Roadmap roadmap;
    private int completedTopics;
    private int totalTopics;
    private int percentage;
}
