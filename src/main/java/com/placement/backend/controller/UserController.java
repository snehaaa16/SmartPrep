package com.placement.backend.controller;

import com.placement.backend.model.User;
import com.placement.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.placement.backend.repository.TopicProgressRepository topicProgressRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserStats(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        long totalTopicsCompleted = topicProgressRepository.countByUserId(user.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("name", user.getName());
        stats.put("email", user.getEmail());
        stats.put("points", user.getPoints());
        stats.put("currentStreak", user.getCurrentStreak());
        stats.put("highestStreak", user.getHighestStreak());
        stats.put("totalTopicsCompleted", totalTopicsCompleted);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        List<User> topUsers = userRepository.findAllUsersByPointsDesc();
        
        // Map to a list of dicts to avoid exposing passwords
        List<Map<String, Object>> leaderboard = topUsers.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", user.getName());
            map.put("points", user.getPoints());
            map.put("currentStreak", user.getCurrentStreak());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }
}
