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
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "original_issue_id", nullable = false)
    private GithubIssue issue;

    @ManyToOne
    @JoinColumn(name = "duplicate_issue_id", nullable = false)
    private GithubIssue duplicateIssue;

    @Column(name = "similarity_score", precision = 5, scale = 2)
    private BigDecimal similarityScore;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    // getters & setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public GithubIssue getIssue() {
        return issue;
    }

    public void setIssue(GithubIssue issue) {
        this.issue = issue;
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
