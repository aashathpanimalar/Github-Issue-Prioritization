package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long> {
    Page<ProjectActivity> findByProjectOrderByCreatedAtDesc(Project project, Pageable pageable);
    Page<ProjectActivity> findByProjectInOrderByCreatedAtDesc(List<Project> projects, Pageable pageable);
}
