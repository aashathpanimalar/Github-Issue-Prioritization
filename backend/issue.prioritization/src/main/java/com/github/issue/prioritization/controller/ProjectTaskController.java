package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.ProjectTask;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.UserRepository;
import com.github.issue.prioritization.service.ProjectTaskService;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProjectTaskController {

    private final ProjectTaskService taskService;
    private final LoggedInUserUtil loggedInUserUtil;
    private final UserRepository userRepository;

    public ProjectTaskController(ProjectTaskService taskService, 
                                 LoggedInUserUtil loggedInUserUtil,
                                 UserRepository userRepository) {
        this.taskService = taskService;
        this.loggedInUserUtil = loggedInUserUtil;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ProjectTask> createTask(@PathVariable Long projectId, @RequestBody ProjectTask task) {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(taskService.createTask(projectId, task, user));
    }

    @GetMapping
    public ResponseEntity<List<ProjectTask>> getTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<ProjectTask> updateStatus(@PathVariable Long taskId, @RequestBody Map<String, String> payload) {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, payload.get("status"), user));
    }

    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<ProjectTask> assignTask(@PathVariable Long taskId, @RequestBody Map<String, Integer> payload) {
        User user = loggedInUserUtil.getLoggedInUser();
        User assignee = userRepository.findById(payload.get("userId"))
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
        return ResponseEntity.ok(taskService.assignTask(taskId, assignee, user));
    }
}
