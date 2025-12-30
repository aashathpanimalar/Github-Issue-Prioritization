package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.IssueAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueAnalysisRepository
        extends JpaRepository<IssueAnalysis, Integer> {
}
