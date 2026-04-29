package com.placement.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyReviewResponse {
    private int topicsCompletedToday;
    private String summary;
    private String flashcardsJson; // This will contain the stringified JSON array
}
