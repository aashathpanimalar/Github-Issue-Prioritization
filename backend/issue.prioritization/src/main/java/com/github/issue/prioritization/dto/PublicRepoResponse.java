package com.github.issue.prioritization.dto;

public class PublicRepoResponse {

    private String repoName;
    private String owner;
    private int openIssuesCount;

    public PublicRepoResponse(String repoName, String owner, int openIssuesCount) {
        this.repoName = repoName;
        this.owner = owner;
        this.openIssuesCount = openIssuesCount;
    }

    public String getRepoName() {
        return repoName;
    }

    public String getOwner() {
        return owner;
    }

    public int getOpenIssuesCount() {
        return openIssuesCount;
    }
}
