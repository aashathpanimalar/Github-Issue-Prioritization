package com.github.issue.prioritization.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_history")
public class AnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Integer historyId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "repo_id", nullable = false)
    private Repository repository;

    @Column(name = "total_issues")
    private Integer totalIssues;

    @Column(name = "high_priority_count")
    private Integer highPriorityCount;

    @Column(name = "medium_priority_count")
    private Integer mediumPriorityCount;

    @Column(name = "low_priority_count")
    private Integer lowPriorityCount;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    // getters and setters

    public Integer getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Integer historyId) {
        this.historyId = historyId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Repository getRepository() {
        return repository;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    public Integer getTotalIssues() {
        return totalIssues;
    }

    public void setTotalIssues(Integer totalIssues) {
        this.totalIssues = totalIssues;
    }

    public Integer getHighPriorityCount() {
        return highPriorityCount;
    }

    public void setHighPriorityCount(Integer highPriorityCount) {
        this.highPriorityCount = highPriorityCount;
    }

    public Integer getMediumPriorityCount() {
        return mediumPriorityCount;
    }

    public void setMediumPriorityCount(Integer mediumPriorityCount) {
        this.mediumPriorityCount = mediumPriorityCount;
    }

    public Integer getLowPriorityCount() {
        return lowPriorityCount;
    }

    public void setLowPriorityCount(Integer lowPriorityCount) {
        this.lowPriorityCount = lowPriorityCount;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
