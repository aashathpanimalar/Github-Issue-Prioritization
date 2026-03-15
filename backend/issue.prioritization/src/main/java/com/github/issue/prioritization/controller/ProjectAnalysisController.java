package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectTask;
import com.github.issue.prioritization.repository.ProjectRepository;
import com.github.issue.prioritization.repository.ProjectTaskRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/ai-analysis")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProjectAnalysisController {

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository taskRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.agent.url:http://localhost:8001}")
    private String aiAgentUrl;

    public ProjectAnalysisController(ProjectRepository projectRepository,
                                     ProjectTaskRepository taskRepository,
                                     RestTemplate restTemplate) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> analyzeProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        List<ProjectTask> tasks = taskRepository.findByProject(project);
        
        // Prepare data for AI agent
        Map<String, Object> payload = new HashMap<>();
        payload.put("projectName", project.getName());
        payload.put("description", project.getDescription());
        payload.put("tasks", tasks.stream().map(t -> {
            Map<String, Object> taskMap = new HashMap<>();
            taskMap.put("title", t.getTitle());
            taskMap.put("status", t.getStatus());
            taskMap.put("priority", t.getPriority());
            taskMap.put("assignee", t.getAssignedTo() != null ? t.getAssignedTo().getName() : "Unassigned");
            return taskMap;
        }).collect(Collectors.toList()));

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(aiAgentUrl + "/analyze-project", payload, Map.class);
            return ResponseEntity.ok(aiResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "AI Agent unavailable");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(503).body(errorResponse);
        }
    }
}
