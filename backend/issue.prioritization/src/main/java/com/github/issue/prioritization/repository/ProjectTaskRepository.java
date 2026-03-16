package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByProject(Project project);
    long countByProjectAndStatus(Project project, String status);
    long countByProject(Project project);
    List<ProjectTask> findByProjectInAndStatus(List<Project> projects, String status);
    List<ProjectTask> findByProjectInAndPriorityIn(List<Project> projects, List<String> priorities);
}
