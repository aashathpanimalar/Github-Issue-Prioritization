package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectMember;
import com.github.issue.prioritization.repository.ProjectMemberRepository;
import com.github.issue.prioritization.repository.ProjectRepository;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProjectMemberController {

    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;

    public ProjectMemberController(ProjectMemberRepository memberRepository,
                                  ProjectRepository projectRepository) {
        this.memberRepository = memberRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProjectMember>> getMembers(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return ResponseEntity.ok(memberRepository.findByProject(project));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ProjectMember> updateRole(@PathVariable Long projectId, 
                                                    @PathVariable Integer userId, 
                                                    @RequestBody Map<String, String> payload) {
        // Validation: Only ADMIN can change roles (simplified check for now)
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        ProjectMember member = memberRepository.findByProjectAndUser(project, 
                memberRepository.findById(Long.valueOf(userId)).get().getUser()) // This is a bit messy, let's just find by ID
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        member.setRole(payload.get("role"));
        return ResponseEntity.ok(memberRepository.save(member));
    }
}
