package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.Project;
import com.github.issue.prioritization.entity.ProjectMember;
import com.github.issue.prioritization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByUser(User user);
    List<ProjectMember> findByProject(Project project);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
}
