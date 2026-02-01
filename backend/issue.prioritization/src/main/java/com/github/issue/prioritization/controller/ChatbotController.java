package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.ChatMessageDto;
import com.github.issue.prioritization.dto.ChatResponseDto;
import com.github.issue.prioritization.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDto> sendMessage(@RequestBody ChatMessageDto chatMessage) {
        ChatResponseDto response = chatbotService.sendMessage(chatMessage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    public ResponseEntity<ChatResponseDto> analyzeIssue(@RequestBody ChatMessageDto chatMessage) {
        ChatResponseDto response = chatbotService.analyzeIssue(chatMessage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/suggest")
    public ResponseEntity<ChatResponseDto> suggestSolution(@RequestBody ChatMessageDto chatMessage) {
        ChatResponseDto response = chatbotService.suggestSolution(chatMessage);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chatbot service is running");
    }
}
