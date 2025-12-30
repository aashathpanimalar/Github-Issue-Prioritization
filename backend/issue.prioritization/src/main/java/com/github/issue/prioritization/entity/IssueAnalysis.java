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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private GithubIssue githubIssue;

    @Column(name = "predicted_priority", nullable = false)
    private String predictedPriority;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    // ===== Getters & Setters =====

    public Integer getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(Integer analysisId) {
        this.analysisId = analysisId;
    }

    public GithubIssue getGithubIssue() {
        return githubIssue;
    }

    public void setGithubIssue(GithubIssue githubIssue) {
        this.githubIssue = githubIssue;
    }

    public String getPredictedPriority() {
        return predictedPriority;
    }

    public void setPredictedPriority(String predictedPriority) {
        this.predictedPriority = predictedPriority;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
