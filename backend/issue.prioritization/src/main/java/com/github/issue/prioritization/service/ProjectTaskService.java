package com.github.issue.prioritization.service;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectTask;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.ProjectTaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectTaskService {

    private final ProjectTaskRepository taskRepository;
    private final ProjectService projectService;

    public ProjectTaskService(ProjectTaskRepository taskRepository, ProjectService projectService) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
    }

    @Transactional
    public ProjectTask createTask(Long projectId, ProjectTask task, User creator) {
        Project project = projectService.getProjectById(projectId);
        task.setProject(project);
        task.setCreatedBy(creator);
        
        ProjectTask savedTask = taskRepository.save(task);
        
        projectService.logActivity(project, creator, "CREATED", 
            "created task: " + task.getTitle());
        
        return savedTask;
    }

    public List<ProjectTask> getTasksByProject(Long projectId) {
        Project project = projectService.getProjectById(projectId);
        return taskRepository.findByProject(project);
    }

    @Transactional
    public ProjectTask updateTaskStatus(Long taskId, String status, User user) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        String oldStatus = task.getStatus();
        task.setStatus(status);
        ProjectTask updatedTask = taskRepository.save(task);

        projectService.logActivity(task.getProject(), user, "STATUS_CHANGED", 
            "changed task '" + task.getTitle() + "' status from " + oldStatus + " to " + status);
        
        return updatedTask;
    }

    @Transactional
    public ProjectTask assignTask(Long taskId, User assignee, User assigner) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setAssignedTo(assignee);
        ProjectTask updatedTask = taskRepository.save(task);

        projectService.logActivity(task.getProject(), assigner, "ASSIGNED", 
            "assigned task '" + task.getTitle() + "' to " + assignee.getName());
        
        return updatedTask;
    }
}
