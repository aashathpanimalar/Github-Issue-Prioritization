package com.github.issue.prioritization.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repository")
public class Repository {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "repo_id")
    private Integer repoId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "repo_owner", nullable = false)
    private String repoOwner;

    @Column(name = "repo_name", nullable = false)
    private String repoName;

    @Column(name = "repo_url", nullable = false)
    private String repoUrl;

    @Column(name = "repo_type", nullable = false)
    private String repoType; // PUBLIC / PRIVATE

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    // getters and setters
}
