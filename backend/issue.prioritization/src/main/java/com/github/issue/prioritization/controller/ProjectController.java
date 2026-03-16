package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.service.ProjectService;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import com.github.issue.prioritization.dto.ProjectStatsResponse;
import com.github.issue.prioritization.entity.ProjectActivity;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProjectController {

    private final ProjectService projectService;
    private final LoggedInUserUtil loggedInUserUtil;

    public ProjectController(ProjectService projectService, LoggedInUserUtil loggedInUserUtil) {
        this.projectService = projectService;
        this.loggedInUserUtil = loggedInUserUtil;
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Map<String, String> payload) {
        User user = loggedInUserUtil.getLoggedInUser();
        Project project = projectService.createProject(
                payload.get("name"),
                payload.get("description"),
                payload.get("githubRepoUrl"),
                user
        );
        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getUserProjects() {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(projectService.getUserProjects(user));
    }

    @GetMapping("/stats")
    public ResponseEntity<ProjectStatsResponse> getProjectStats() {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(projectService.getProjectStats(user));
    }

    @GetMapping("/activity")
    public ResponseEntity<Page<ProjectActivity>> getGlobalActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(projectService.getGlobalActivity(user, page, size));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<com.github.issue.prioritization.entity.ProjectTask>> getMyReviews() {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(projectService.getMyReviews(user));
    }

    @GetMapping("/my-conflicts")
    public ResponseEntity<List<com.github.issue.prioritization.entity.ProjectTask>> getMyConflicts() {
        User user = loggedInUserUtil.getLoggedInUser();
        return ResponseEntity.ok(projectService.getMyConflicts(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping("/join/{token}")
    public ResponseEntity<Map<String, String>> joinProject(@PathVariable String token) {
        User user = loggedInUserUtil.getLoggedInUser();
        projectService.joinProject(token, user);
        return ResponseEntity.ok(Map.of("message", "Joined successfully"));
    }
}
