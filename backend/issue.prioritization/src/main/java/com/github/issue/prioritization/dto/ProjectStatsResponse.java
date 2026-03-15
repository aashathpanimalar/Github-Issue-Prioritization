package com.github.issue.prioritization.dto;

public class ProjectStatsResponse {
    private long totalProjects;
    private long activeBranches;
    private long pendingReviews;
    private long recentReleases;

    public ProjectStatsResponse(long totalProjects, long activeBranches, long pendingReviews, long recentReleases) {
        this.totalProjects = totalProjects;
        this.activeBranches = activeBranches;
        this.pendingReviews = pendingReviews;
        this.recentReleases = recentReleases;
    }

    // Getters and Setters
    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
    public long getActiveBranches() { return activeBranches; }
    public void setActiveBranches(long activeBranches) { this.activeBranches = activeBranches; }
    public long getPendingReviews() { return pendingReviews; }
    public void setPendingReviews(long pendingReviews) { this.pendingReviews = pendingReviews; }
    public long getRecentReleases() { return recentReleases; }
    public void setRecentReleases(long recentReleases) { this.recentReleases = recentReleases; }
}
