package com.github.issue.prioritization.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "duplicate_issue")
public class DuplicateIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "duplicate_id")
    private Integer duplicateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_issue_id", nullable = false)
    private GithubIssue originalIssue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duplicate_issue_id", nullable = false)
    private GithubIssue duplicateIssue;

    @Column(name = "similarity_score", precision = 5, scale = 2)
    private BigDecimal similarityScore;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    // ===== Getters & Setters =====

    public Integer getDuplicateId() {
        return duplicateId;
    }

    public void setDuplicateId(Integer duplicateId) {
        this.duplicateId = duplicateId;
    }

    public GithubIssue getOriginalIssue() {
        return originalIssue;
    }

    public void setOriginalIssue(GithubIssue originalIssue) {
        this.originalIssue = originalIssue;
    }

    public GithubIssue getDuplicateIssue() {
        return duplicateIssue;
    }

    public void setDuplicateIssue(GithubIssue duplicateIssue) {
        this.duplicateIssue = duplicateIssue;
    }

    public BigDecimal getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(BigDecimal similarityScore) {
        this.similarityScore = similarityScore;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }
}
