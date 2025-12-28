package com.github.issue.prioritization.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "duplicate_issue")
public class DuplicateIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "duplicate_id")
    private Integer duplicateId;

    @ManyToOne
    @JoinColumn(name = "original_issue_id", nullable = false)
    private GithubIssue originalIssue;

    @ManyToOne
    @JoinColumn(name = "duplicate_issue_id", nullable = false)
    private GithubIssue duplicateIssue;

    @Column(name = "similarity_score")
    private BigDecimal similarityScore;

    // getters and setters
}
