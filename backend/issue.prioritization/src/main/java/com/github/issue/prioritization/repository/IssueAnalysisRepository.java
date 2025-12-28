package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.IssueAnalysis;
import com.github.issue.prioritization.entity.GithubIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IssueAnalysisRepository extends JpaRepository<IssueAnalysis, Integer> {

    Optional<IssueAnalysis> findByGithubIssue(GithubIssue githubIssue);
}
