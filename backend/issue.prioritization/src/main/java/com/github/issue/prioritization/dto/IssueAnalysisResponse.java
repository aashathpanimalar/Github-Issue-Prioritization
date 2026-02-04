package com.github.issue.prioritization.dto;

public class IssueAnalysisResponse {

    private Integer issueId;
    private String title;
    private String priority;
    private Double score;
    private String summary;
    private Double riskScore;
    private String riskLevel;

    public IssueAnalysisResponse() {
    }

    public IssueAnalysisResponse(
            Integer issueId,
            String title,
            String priority,
            Double score,
            String summary,
            Double riskScore,
            String riskLevel) {

        this.issueId = issueId;
        this.title = title;
        this.priority = priority;
        this.score = score;
        this.summary = summary;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
    }

    public Integer getIssueId() {
        return issueId;
    }

    public void setIssueId(Integer issueId) {
        this.issueId = issueId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
}
