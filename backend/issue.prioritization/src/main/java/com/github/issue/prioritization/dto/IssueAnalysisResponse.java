package com.github.issue.prioritization.dto;

public class IssueAnalysisResponse {

    private Integer issueId;
    private String title;
    private String priority;

    public IssueAnalysisResponse(
            Integer issueId,
            String title,
            String priority) {

        this.issueId = issueId;
        this.title = title;
        this.priority = priority;
    }

    // getters and setters
}
