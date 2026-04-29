package com.placement.backend.controller;


import com.placement.backend.model.Roadmap;
import com.placement.backend.model.Subject;
import com.placement.backend.model.Topic;
import com.placement.backend.model.User;
import com.placement.backend.repository.RoadmapRepository;
import com.placement.backend.repository.SubjectRepository;
import com.placement.backend.repository.TopicRepository;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.service.AiService;
import com.placement.backend.service.ProgressService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import com.placement.backend.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private RoadmapRepository roadmapRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/test-notification")
    public ResponseEntity<String> testNotification() {
        notificationService.announceLiveQuiz();
        return ResponseEntity.ok("Notification broadcasted!");
    }

    @PostMapping("/test-live-question")
    public ResponseEntity<String> testLiveQuestion() {
        Map<String, Object> question = Map.of(
            "id", 101,
            "question", "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
            "options", List.of("O(n)", "O(log n)", "O(1)", "O(n log n)"),
            "correctIndex", 1,
            "timer", 15
        );
        notificationService.broadcastLiveQuestion(Map.of("type", "QUESTION", "payload", question));
        return ResponseEntity.ok("Live Question broadcasted!");
    }

    private static boolean isGameRunning = false;

    @PostMapping("/start-ai-live-quiz")
    public ResponseEntity<String> startAiLiveQuiz() {
        System.out.println(">>> REQUEST RECEIVED: /api/ai/start-ai-live-quiz");
        
        if (isGameRunning) {
            System.out.println(">>> REJECTED: Game is already running.");
            return ResponseEntity.badRequest().body("Game is already running!");
        }
        
        try {
            final String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println(">>> AUTHENTICATED USER: " + currentUserEmail);
            
            isGameRunning = true;
            QuizSocketController.clearScores(); 
            
            CompletableFuture.runAsync(() -> {
            try {
                // 1. Generate Questions (10-15 from AI or 10 Fallback)
                String jsonQuestions = aiService.generateMixedCseQuestions();
                List<Map<String, Object>> questions;
                ObjectMapper mapper = new ObjectMapper();
                
                if (jsonQuestions == null || jsonQuestions.equals("[]")) {
                    questions = List.of(
                        Map.of("question", "What is the time complexity of searching in a Balanced BST?", "options", List.of("O(1)", "O(log n)", "O(n)", "O(n log n)"), "correctIndex", 1, "timer", 15),
                        Map.of("question", "Which layer of OSI model handles routing?", "options", List.of("Physical", "Data Link", "Network", "Transport"), "correctIndex", 2, "timer", 15),
                        Map.of("question", "What does ACID stand for in DBMS?", "options", List.of("Atomicity, Consistency, Isolation, Durability", "Access, Control, Input, Data", "Auto, Count, Index, Delete", "None"), "correctIndex", 0, "timer", 15),
                        Map.of("question", "Which data structure is used for BFS of a graph?", "options", List.of("Stack", "Queue", "Tree", "Heap"), "correctIndex", 1, "timer", 15),
                        Map.of("question", "In C++, what is a virtual function used for?", "options", List.of("Recursion", "Polymorphism", "Encapsulation", "None"), "correctIndex", 1, "timer", 15),
                        Map.of("question", "What is the size of an int in Java (typically)?", "options", List.of("16-bit", "32-bit", "64-bit", "8-bit"), "correctIndex", 1, "timer", 15),
                        Map.of("question", "Which scheduling algorithm is non-preemptive?", "options", List.of("Round Robin", "FCFS", "SRTF", "Priority"), "correctIndex", 1, "timer", 15),
                        Map.of("question", "What is the port number for HTTP?", "options", List.of("21", "22", "80", "443"), "correctIndex", 2, "timer", 15),
                        Map.of("question", "What is the purpose of a primary key?", "options", List.of("Sorting", "Uniqueness", "Indexing", "Linking"), "correctIndex", 1, "timer", 15),
                        Map.of("question", "Which language is used for Android (Native)?", "options", List.of("Swift", "Kotlin", "Python", "PHP"), "correctIndex", 1, "timer", 15)
                    );
                } else {
                    questions = mapper.readValue(jsonQuestions, List.class);
                }

                // 2. Initial Player List
                List<Map<String, Object>> players = new ArrayList<>(List.of(
                    new HashMap<>(Map.of("name", "User (You)", "score", 0, "email", currentUserEmail)),
                    new HashMap<>(Map.of("name", "Rahul (AI)", "score", 0)),
                    new HashMap<>(Map.of("name", "Sneha (AI)", "score", 0))
                ));

                // 3. Game Loop
                for (int i = 0; i < questions.size(); i++) {
                    notificationService.broadcastLiveQuestion(Map.of("type", "QUESTION", "payload", questions.get(i)));
                    Thread.sleep(16000); 

                    // Update Real Scores from Socket Controller
                    int realUserScore = QuizSocketController.activeQuizScores.getOrDefault(currentUserEmail, 0);
                    
                    for (Map<String, Object> p : players) {
                        if (p.get("email") != null && p.get("email").equals(currentUserEmail)) {
                            p.put("score", realUserScore);
                        } else if (p.get("name").toString().contains("(AI)")) {
                            // AI bots also improve their scores randomly
                            p.put("score", (int)p.get("score") + (Math.random() > 0.5 ? 5 : 0));
                        }
                    }
                    players.sort((a, b) -> (int)b.get("score") - (int)a.get("score"));

                    notificationService.broadcastLiveQuestion(Map.of("type", "LEADERBOARD", "payload", players));
                    Thread.sleep(5000);
                }

                // 4. FINAL RESULTS
                notificationService.broadcastLiveQuestion(Map.of("type", "FINAL_RESULTS", "payload", players));
                
                Map<String, Object> winner = players.get(0);
                if (winner.get("email") != null && winner.get("email").equals(currentUserEmail)) {
                    progressService.rewardXp(currentUserEmail, 50); 
                }

            } catch (Exception e) {
                System.err.println(">>> ASYNC ERROR: " + e.getMessage());
                isGameRunning = false;
            }
        });
        return ResponseEntity.ok("AI Quiz Started!");
    } catch (Exception e) {
        isGameRunning = false;
        return ResponseEntity.status(401).body("Auth error: " + e.getMessage());
    }
}

    @PostMapping("/generate-quiz/{topicId}")
    public ResponseEntity<String> generateQuiz(@PathVariable Long topicId) {

        Topic topic = topicRepository.findById(topicId).orElse(null);
        if (topic == null) {
            return ResponseEntity.notFound().build();
        }

        // 1. Send the theory text to AI
        String generatedJsonQuiz = aiService.generateQuizFromTheory(topic.getTheoryContent());

        // 2. Return the AI's response directly to React
        return ResponseEntity.ok(generatedJsonQuiz);
    }

    @PostMapping("/generate-roadmap")
    public ResponseEntity<?> generateCustomRoadmap(@RequestBody Map<String, String> request, Authentication authentication) {
        String subjectId = request.get("subjectId");
        String level = request.get("level");
        String goal = request.get("goal");
        String company = request.get("company") != null ? request.get("company") : "Generic Tech";

        if (subjectId == null || level == null || goal == null) {
            return ResponseEntity.badRequest().body("subjectId, level, and goal are required.");
        }

        final long parsedSubjectId;
        try {
            parsedSubjectId = Long.parseLong(subjectId);
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body("subjectId must be a valid number.");
        }

        // 1. Find the subject
        Subject subject = subjectRepository.findById(parsedSubjectId).orElse(null);
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }

        // 2. Get the authenticated user
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Call AI to generate topics
        String aiResponse = aiService.generateCustomRoadmap(subject.getName(), level, goal, company);

        // Simple cleaning if AI includes markdown code blocks
        if (aiResponse != null && aiResponse.contains("```json")) {
            aiResponse = aiResponse.substring(aiResponse.indexOf("```json") + 7);
            if (aiResponse.contains("```")) {
                aiResponse = aiResponse.substring(0, aiResponse.indexOf("```"));
            }
        } else if (aiResponse != null && aiResponse.contains("```")) {
            aiResponse = aiResponse.substring(aiResponse.indexOf("```") + 3);
            if (aiResponse.contains("```")) {
                aiResponse = aiResponse.substring(0, aiResponse.indexOf("```"));
            }
        }
        if (aiResponse != null) {
            aiResponse = aiResponse.trim();
        }

        try {
            return persistCustomRoadmap(user, subject, aiResponse != null && !aiResponse.isBlank() ? aiResponse : buildFallbackCustomRoadmapJson(subject.getName(), level, goal, company));
        } catch (Exception e) {
            e.printStackTrace();
            try {
                return persistCustomRoadmap(user, subject, buildFallbackCustomRoadmapJson(subject.getName(), level, goal, company));
            } catch (Exception fallbackException) {
                fallbackException.printStackTrace();
                return ResponseEntity.internalServerError().body("Failed to generate roadmap. Please try again.");
            }
        }
    }

    private ResponseEntity<?> persistCustomRoadmap(User user, Subject subject, String roadmapJson) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode topicsArray = mapper.readTree(roadmapJson);

        if (!topicsArray.isArray() || topicsArray.isEmpty()) {
            throw new IllegalArgumentException("Roadmap JSON must be a non-empty array");
        }

        Roadmap roadmap = new Roadmap();
        roadmap.setSubject(subject);
        roadmap.setUser(user);
        roadmap.setType(Roadmap.RoadmapType.CUSTOM);
        roadmap = roadmapRepository.save(roadmap);

        String subjectName = subject.getName();
        int order = 1;
        for (JsonNode topicNode : topicsArray) {
            Topic topic = new Topic();
            topic.setRoadmap(roadmap);
            String title = topicNode.path("title").asText("Topic " + order);
            topic.setTitle(title);
            topic.setTheoryContent(normalizeTheoryContent(topicNode.path("theoryContent").asText(null), subjectName, title, order));
            topic.setVideoUrl(normalizeVideoUrl(topicNode.path("videoUrl").asText(null), subjectName, title));
            topic.setCodingQuestions(normalizeCodingQuestions(topicNode.get("codingQuestions"), subjectName, title));

            topic.setOrderIndex(order++);
            topicRepository.save(topic);
        }

        progressService.saveRoadmapForUser(user, roadmap.getId());
        return ResponseEntity.ok(Map.of("roadmapId", roadmap.getId(), "source", "ai-or-fallback"));
    }

    private String normalizeTheoryContent(String rawTheoryContent, String subjectName, String title, int order) {
        String cleaned = stripMarkdownFences(rawTheoryContent);
        if (cleaned == null || cleaned.isBlank()) {
            return buildFallbackTheoryContent(subjectName, title, order);
        }

        if (cleaned.contains("## Overview") && cleaned.contains("## Key Concepts") && cleaned.contains("## Example")
                && cleaned.contains("## Common Mistakes") && cleaned.contains("## Interview Notes")) {
            return cleaned.trim();
        }

        return "## Overview\n\n"
                + cleaned.trim()
                + "\n\n## Key Concepts\n"
                + "- Core idea: understand how this topic works in practice.\n"
                + "- Interview focus: know the definitions, trade-offs, and edge cases.\n\n"
                + "## Example\n"
                + "```text\n"
                + "Try one small example or dry run for " + title + ".\n"
                + "```\n\n"
                + "## Common Mistakes\n"
                + "- Skipping fundamentals before practice.\n"
                + "- Not revising edge cases.\n\n"
                + "## Interview Notes\n"
                + "- Revise this section before interviews for " + subjectName + ".\n"
                + "- Be able to explain the concept in simple words.";
    }

    private String buildFallbackTheoryContent(String subjectName, String title, int order) {
        return "## Overview\n\n"
                + "This is topic " + order + " of your custom roadmap for **" + subjectName + "**.\n\n"
                + "## Key Concepts\n"
                + "- Understand the main idea behind " + title + ".\n"
                + "- Learn the definitions and how the concept is used in interviews.\n\n"
                + "## Example\n"
                + "```text\n"
                + "Write a short example or solve one small practice problem here.\n"
                + "```\n\n"
                + "## Common Mistakes\n"
                + "- Memorizing without understanding.\n"
                + "- Ignoring easy-to-miss edge cases.\n\n"
                + "## Interview Notes\n"
                + "- Revise the topic before mock interviews.\n"
                + "- Practice explaining it clearly in 1-2 minutes.";
    }

    private String normalizeVideoUrl(String rawVideoUrl, String subjectName, String title) {
        String cleaned = stripMarkdownFences(rawVideoUrl);
        if (isValidYouTubeUrl(cleaned)) {
            // Convert various YouTube URL forms to the embeddable URL
            String id = null;
            try {
                if (cleaned.contains("watch?v=")) {
                    String[] parts = cleaned.split("v=");
                    id = parts[1].split("&")[0];
                } else if (cleaned.contains("youtu.be/")) {
                    String[] parts = cleaned.split("youtu.be/");
                    id = parts[1].split("[?&]")[0];
                } else if (cleaned.contains("/shorts/")) {
                    String[] parts = cleaned.split("/shorts/");
                    id = parts[1].split("[?&]")[0];
                }
            } catch (Exception ignore) {
            }

            if (id != null && !id.isBlank()) {
                return "https://www.youtube.com/embed/" + id.trim();
            }
            return cleaned.trim();
        }

        // If not a recognised YouTube URL, return empty so frontend can show a placeholder
        return "";
    }

    private String normalizeCodingQuestions(JsonNode codingQuestionsNode, String subjectName, String title) {
        if (codingQuestionsNode != null && codingQuestionsNode.isArray()) {
            List<String> links = new ArrayList<>();

            for (JsonNode questionNode : codingQuestionsNode) {
                String qTitle = questionNode.path("title").asText("");
                String url = questionNode.path("url").asText("");

                if (isValidPracticeUrl(url)) {
                    if (qTitle.isBlank()) {
                        qTitle = "Practice Question";
                    }
                    links.add("- [" + qTitle + "](" + url.trim() + ")");
                }
            }

            if (!links.isEmpty()) {
                return String.join("\n", links);
            }
        }

        if (codingQuestionsNode != null && codingQuestionsNode.isTextual()) {
            String cleaned = stripMarkdownFences(codingQuestionsNode.asText());
            if (cleaned != null && cleaned.contains("http")) {
                return cleaned.trim();
            }
        }

        return buildFallbackCodingQuestions(subjectName, title);
    }

    private String buildFallbackCodingQuestions(String subjectName, String title) {
        return "- [LeetCode Problem Set](https://leetcode.com/problemset/)\n"
                + "- [LeetCode Top Interview 150](https://leetcode.com/studyplan/top-interview-150/)\n"
                + "- [GeeksforGeeks Practice](https://practice.geeksforgeeks.org/)\n"
                + "- [GeeksforGeeks Interview Preparation](https://www.geeksforgeeks.org/interview-preparation-for-programming/)";
    }

    private String stripMarkdownFences(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        return cleaned.trim();
    }

    private boolean isValidYouTubeUrl(String url) {
        return url != null && (url.startsWith("https://www.youtube.com/watch")
                || url.startsWith("https://youtu.be/")
                || url.startsWith("https://www.youtube.com/shorts/"));
    }

    private boolean isValidPracticeUrl(String url) {
        return url != null && (url.startsWith("https://leetcode.com/")
                || url.startsWith("https://www.geeksforgeeks.org/")
                || url.startsWith("https://practice.geeksforgeeks.org/"));
    }

    private String stripNumberPrefix(String title) {
        if (title == null) {
            return "topic";
        }
        return title.replaceFirst("^\\s*\\d+[\\.)-:]?\\s*", "").trim();
    }

    private String buildFallbackCustomRoadmapJson(String subjectName, String level, String goal, String company) throws Exception {
        List<Map<String, Object>> topics = new ArrayList<>();

        topics.add(createFallbackTopic(1, "Core Fundamentals of " + subjectName,
                "Start with the essential building blocks of " + subjectName + ". Focus on the terminology, basic workflows, and the must-know concepts for a learner at " + level + ".\n\nThis roadmap is aligned with your goal of " + goal + " for " + company + ".",
                "",
                "- [LeetCode Problem Set](https://leetcode.com/problemset/)\n- [GeeksforGeeks Practice](https://practice.geeksforgeeks.org/)"));

        topics.add(createFallbackTopic(2, "Important Patterns and Concepts",
                "Build on the fundamentals by learning recurring patterns, standard abstractions, and interview-relevant concepts that appear often in " + subjectName + " questions.",
                "",
                "- [Top interview problems](https://www.geeksforgeeks.org/top-50-problems-on-data-structure-and-algorithms/)\n- [LeetCode Explore](https://leetcode.com/explore/)"));

        topics.add(createFallbackTopic(3, "Problem-Solving Practice",
                "Practice applying what you learned to medium-difficulty problems. Focus on reading constraints, choosing the right approach, and explaining your solution clearly.",
                "",
                "- [LeetCode Problem Set](https://leetcode.com/problemset/)\n- [GeeksforGeeks Practice](https://practice.geeksforgeeks.org/)"));

        topics.add(createFallbackTopic(4, "Interview-Focused Revision",
                "Review the topics that matter most for " + company + "-style interviews. Revise common questions, edge cases, and time complexity tradeoffs.",
                "",
                "- [Interview preparation guide](https://www.geeksforgeeks.org/interview-preparation-for-programming/)\n- [LeetCode Interview 150](https://leetcode.com/studyplan/top-interview-150/)"));

        topics.add(createFallbackTopic(5, "Mock Interview Drills",
                "Simulate interview conditions by solving problems within a timer and speaking your reasoning out loud. This helps you perform better under pressure.",
                "",
                "- [Mock interview practice](https://leetcode.com/problemset/)\n- [Interview questions collection](https://www.geeksforgeeks.org/interview-preparation-for-programming/)"));

        topics.add(createFallbackTopic(6, "Final Revision and Confidence Boost",
                "Finish with quick revision notes, a checklist of must-remember points, and short recap sessions so you enter interviews with confidence.",
                "",
                "- [Revision practice](https://www.geeksforgeeks.org/)\n- [LeetCode daily challenge](https://leetcode.com/problemset/)"));

        return new ObjectMapper().writeValueAsString(topics);
    }

    private Map<String, Object> createFallbackTopic(int number, String title, String theoryContent, String videoUrl, String codingQuestions) {
        Map<String, Object> topic = new HashMap<>();
        topic.put("title", number + ". " + title);
        topic.put("theoryContent", theoryContent);
        topic.put("videoUrl", videoUrl);
        topic.put("codingQuestions", codingQuestions);
        return topic;
    }

    private String youtubeSearchUrl(String query) {
        return "https://www.youtube.com/results?search_query=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
    }
}
