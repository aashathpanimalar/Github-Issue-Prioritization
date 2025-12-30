package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.DuplicateIssue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DuplicateIssueRepository
        extends JpaRepository<DuplicateIssue, Integer> {
}
