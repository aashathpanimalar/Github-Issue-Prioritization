package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByInviteToken(String token);
}
