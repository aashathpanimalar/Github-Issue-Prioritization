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
}
