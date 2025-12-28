package com.github.issue.prioritization.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_analysis")
public class IssueAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Integer analysisId;

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private GithubIssue githubIssue;

    @Column(name = "predicted_priority", nullable = false)
    private String predictedPriority; // HIGH / MEDIUM / LOW

    @Column(name = "confidence_score")
    private BigDecimal confidenceScore;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    // getters and setters
}
