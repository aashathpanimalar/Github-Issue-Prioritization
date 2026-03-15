package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectActivity;
import com.github.issue.prioritization.repository.ProjectActivityRepository;
import com.github.issue.prioritization.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/activity")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProjectActivityController {

    private final ProjectActivityRepository activityRepository;
    private final ProjectRepository projectRepository;

    public ProjectActivityController(ProjectActivityRepository activityRepository, ProjectRepository projectRepository) {
        this.activityRepository = activityRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public ResponseEntity<Page<ProjectActivity>> getActivity(@PathVariable Long projectId,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return ResponseEntity.ok(activityRepository.findByProjectOrderByCreatedAtDesc(project, PageRequest.of(page, size)));
    }
}
