package com.github.issue.prioritization.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "github_issue")
public class GithubIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Integer issueId;

    @ManyToOne
    @JoinColumn(name = "repo_id", nullable = false)
    private Repository repository;

    @Column(name = "github_issue_number", nullable = false)
    private Integer githubIssueNumber;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "labels")
    private String labels;

    @Column(name = "issue_state")
    private String issueState;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    // getters and setters
}
