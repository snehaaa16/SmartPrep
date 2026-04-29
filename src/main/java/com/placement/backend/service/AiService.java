package com.placement.backend.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, String>> parts = new ArrayList<>();

            Map<String, String> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);

            contentMap.put("parts", parts);
            contents.add(contentMap);
            requestBody.put("contents", contents);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                Map body = response.getBody();
                if (body == null) {
                    throw new IllegalStateException("Gemini returned an empty response body");
                }

                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates == null || candidates.isEmpty()) {
                    throw new IllegalStateException("Gemini response did not contain any candidates");
                }

                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content == null) {
                    throw new IllegalStateException("Gemini candidate did not contain content");
                }

                List<Map<String, String>> responseParts = (List<Map<String, String>>) content.get("parts");
                if (responseParts == null || responseParts.isEmpty() || responseParts.get(0).get("text") == null) {
                    throw new IllegalStateException("Gemini response did not contain text output");
                }

                String jsonText = responseParts.get(0).get("text");
                jsonText = jsonText.replace("```json", "").replace("```", "").trim();
                return jsonText;
            } catch (HttpClientErrorException.TooManyRequests | HttpServerErrorException.ServiceUnavailable e) {
                retryCount++;
                System.out.println("Gemini rate-limited/unavailable. Retry attempt " + retryCount + "...");
                try { Thread.sleep(1500L * retryCount); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            } catch (HttpServerErrorException e) {
                HttpStatusCode statusCode = e.getStatusCode();
                if (statusCode.is5xxServerError()) {
                    retryCount++;
                    System.out.println("Gemini 5xx error. Retry attempt " + retryCount + "...");
                    try { Thread.sleep(1500L * retryCount); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                } else {
                    e.printStackTrace();
                    return null;
                }
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
        return null;
    }

    public String generateQuizFromTheory(String theoryContent) {
        String prompt = "You are an expert tutor. Create a 3-question multiple choice quiz based exactly on this text: "
                + theoryContent + "\n\n"
                + "Return ONLY a valid JSON array of objects. Do not include any markdown formatting like ```json. "
                + "Each object must have: 'question' (string), 'options' (array of 4 strings), and 'answer' (string matching correct option).";
        
        String result = callGemini(prompt);
        return result != null ? result : "[{\"question\":\"AI is currently unavailable.\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"answer\":\"A\"}]";
    }

    public String generateDailySummary(String theoryContent) {
        String prompt = "You are an encouraging AI tutor. The user has just studied the following topics today: "
                + theoryContent + "\n\n"
                + "Write a highly encouraging, personalized 2-paragraph summary of what they learned today. Make them feel proud of their progress! Do not use markdown blocks, just plain text.";
        
        String result = callGemini(prompt);
        return result != null ? result : "No topics is completed at this.";
    }

    public String generateFlashcards(String theoryContent) {
        String prompt = "You are an expert tutor. Create 5-7 interactive flashcards based exactly on this text: "
                + theoryContent + "\n\n"
                + "Return ONLY a valid JSON array of objects. Do not include any markdown formatting like ```json. "
                + "Each object must have: 'front' (the question or concept) and 'back' (the concise answer or definition).";
        
        String result = callGemini(prompt);
        return result != null ? result : "[{\"front\":\"Start the topic and generate a flashcard.\", \"back\":\"\"}]";
    }

    public String generateCustomRoadmap(String subjectName, String level, String goal, String company) {
        String prompt = "You are an expert career coach and curriculum designer for tech placements at " + company + ". "
                + "Create a highly personalized, placement-ready learning roadmap for the subject: \"" + subjectName + "\". "
                + "Student's current level: " + level + ". Their specific goal: \"" + goal + "\". "
                + "\n\nReturn EXACTLY 6 topic objects as a valid JSON array. "
                + "Each topic object must contain these fields:\n"
                + "1. title: a short numbered title.\n"
                + "2. theoryContent: proper markdown with these sections in order -> ## Overview, ## Key Concepts, ## Example, ## Common Mistakes, ## Interview Notes. Use bullets, short paragraphs, and code blocks where helpful.\n"
                + "3. videoUrl: a direct YouTube watch/shorts URL or a YouTube playlist URL only. Do NOT return a search-results page. If you are not sure, use an empty string.\n"
                + "4. codingQuestions: an array of 2-3 objects, each with {\"title\": string, \"url\": string}. Use only real LeetCode or GeeksforGeeks URLs. Do NOT invent URLs and do NOT use search pages.\n"
                + "The roadmap should emphasize what matters for " + company + " interviews. Return only JSON, no markdown fences.";

        String result = callGemini(prompt);
        return result != null ? result : "[]";
    }
    public String generateMixedCseQuestions() {
        String prompt = "You are a master CSE professor. Create 10 to 15 challenging multiple choice questions for a Live Quiz. "
                + "The questions should be a mix of subjects: DSA, Operating Systems, DBMS, Networking, and Computer Architecture. "
                + "For each question, provide: "
                + "1. 'question': The question text. "
                + "2. 'options': Array of 4 strings. "
                + "3. 'correctIndex': Integer (0-3). "
                + "4. 'timer': Set to 15. "
                + "\n\nReturn ONLY a valid JSON array of objects. Do not include markdown like ```json.";

        String result = callGemini(prompt);
        return result != null ? result : "[]";
    }
}

