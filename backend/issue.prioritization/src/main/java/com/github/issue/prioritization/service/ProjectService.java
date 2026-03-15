package com.github.issue.prioritization.service;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectActivity;
import com.github.issue.prioritization.entity.ProjectMember;
import com.github.issue.prioritization.entity.ProjectTask;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.dto.ProjectStatsResponse;
import com.github.issue.prioritization.repository.ProjectActivityRepository;
import com.github.issue.prioritization.repository.ProjectMemberRepository;
import com.github.issue.prioritization.repository.ProjectRepository;
import com.github.issue.prioritization.repository.ProjectTaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectActivityRepository projectActivityRepository;
    private final ProjectTaskRepository projectTaskRepository;

    public ProjectService(ProjectRepository projectRepository, 
                          ProjectMemberRepository projectMemberRepository,
                          ProjectActivityRepository projectActivityRepository,
                          ProjectTaskRepository projectTaskRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.projectActivityRepository = projectActivityRepository;
        this.projectTaskRepository = projectTaskRepository;
    }

    @Transactional
    public Project createProject(String name, String description, String githubUrl, User owner) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setGithubRepoUrl(githubUrl);
        project.setOwner(owner);
        project.setInviteToken(UUID.randomUUID().toString());
        
        Project savedProject = projectRepository.save(project);

        // Add owner as ADMIN member
        ProjectMember member = new ProjectMember();
        member.setProject(savedProject);
        member.setUser(owner);
        member.setRole("ADMIN");
        projectMemberRepository.save(member);

        // Log activity
        logActivity(savedProject, owner, "CREATED", "created the project: " + name);

        return savedProject;
    }

    public List<Project> getUserProjects(User user) {
        return projectMemberRepository.findByUser(user)
                .stream()
                .map(ProjectMember::getProject)
                .collect(Collectors.toList());
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Transactional
    public void joinProject(String token, User user) {
        Project project = projectRepository.findByInviteToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invite link"));

        if (projectMemberRepository.findByProjectAndUser(project, user).isPresent()) {
            throw new RuntimeException("You are already a member of this project");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole("CONTRIBUTOR");
        projectMemberRepository.save(member);

        logActivity(project, user, "MEMBER_JOINED", "joined the project via invite link");
    }

    public void logActivity(Project project, User user, String action, String message) {
        ProjectActivity activity = new ProjectActivity();
        activity.setProject(project);
        activity.setUser(user);
        activity.setAction(action);
        activity.setMessage(message);
        projectActivityRepository.save(activity);
    }

    public ProjectStatsResponse getProjectStats(User user) {
        List<Project> projects = getUserProjects(user);
        long totalProjects = projects.size();
        long pendingReviews = 0;
        long activeBranches = 0;
        long recentReleases = 0;

        for (Project project : projects) {
            pendingReviews += projectTaskRepository.countByProjectAndStatus(project, "IN_REVIEW");
            activeBranches += projectTaskRepository.findByProject(project).stream()
                    .map(ProjectTask::getBranch)
                    .filter(b -> b != null && !b.isEmpty())
                    .distinct()
                    .count();
            // Count tasks completed in last 7 days as releases for now
            recentReleases += projectTaskRepository.findByProject(project).stream()
                    .filter(t -> "COMPLETE".equals(t.getStatus()))
                    .filter(t -> t.getUpdatedAt().isAfter(LocalDateTime.now().minusDays(7)))
                    .count();
        }

        return new ProjectStatsResponse(totalProjects, activeBranches, pendingReviews, recentReleases);
    }

    public Page<ProjectActivity> getGlobalActivity(User user, int page, int size) {
        List<Project> projects = getUserProjects(user);
        if (projects.isEmpty()) {
            return Page.empty();
        }
        return projectActivityRepository.findByProjectInOrderByCreatedAtDesc(projects, PageRequest.of(page, size));
    }

    public List<ProjectTask> getMyReviews(User user) {
        List<Project> projects = getUserProjects(user);
        if (projects.isEmpty()) return java.util.Collections.emptyList();
        return projectTaskRepository.findByProjectInAndStatus(projects, "IN_REVIEW");
    }

    public List<ProjectTask> getMyConflicts(User user) {
        List<Project> projects = getUserProjects(user);
        if (projects.isEmpty()) return java.util.Collections.emptyList();
        return projectTaskRepository.findByProjectInAndPriorityIn(projects, List.of("HIGH", "CRITICAL"));
    }
}
