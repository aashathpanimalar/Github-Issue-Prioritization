package com.github.issue.prioritization.service;

import com.github.issue.prioritization.dto.ChatMessageDto;
import com.github.issue.prioritization.dto.ChatResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChatbotService {

    @Value("${ai.agent.url:http://localhost:8001}")
    private String aiAgentUrl;

    private final RestTemplate restTemplate;

    public ChatbotService() {
        this.restTemplate = new RestTemplate();
    }

    public ChatResponseDto sendMessage(ChatMessageDto chatMessage) {
        try {
            String url = aiAgentUrl + "/chat";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ChatMessageDto> request = new HttpEntity<>(chatMessage, headers);

            ResponseEntity<ChatResponseDto> response = restTemplate.postForEntity(
                    url,
                    request,
                    ChatResponseDto.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("CRITICAL: Chatbot communication error: " + e.getMessage());
            e.printStackTrace();
            return new ChatResponseDto("", false,
                    "AI Service is currently offline. Please ensure the python agent is running on port 8001. Error: "
                            + e.getMessage());
        }
    }

    public ChatResponseDto analyzeIssue(ChatMessageDto chatMessage) {
        try {
            String url = aiAgentUrl + "/analyze-issue";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ChatMessageDto> request = new HttpEntity<>(chatMessage, headers);

            ResponseEntity<ChatResponseDto> response = restTemplate.postForEntity(
                    url,
                    request,
                    ChatResponseDto.class);

            return response.getBody();

        } catch (Exception e) {
            return new ChatResponseDto("", false, "Failed to analyze issue: " + e.getMessage());
        }
    }

    public ChatResponseDto suggestSolution(ChatMessageDto chatMessage) {
        try {
            String url = aiAgentUrl + "/suggest-solution";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ChatMessageDto> request = new HttpEntity<>(chatMessage, headers);

            ResponseEntity<ChatResponseDto> response = restTemplate.postForEntity(
                    url,
                    request,
                    ChatResponseDto.class);

            return response.getBody();

        } catch (Exception e) {
            return new ChatResponseDto("", false, "Failed to suggest solution: " + e.getMessage());
        }
    }
}
