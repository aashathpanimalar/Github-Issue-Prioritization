package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.GithubIssue;
import com.github.issue.prioritization.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GithubIssueRepository extends JpaRepository<GithubIssue, Integer> {

    List<GithubIssue> findByRepository(Repository repository);
}
