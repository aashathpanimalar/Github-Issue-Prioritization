package com.github.issue.prioritization.dto;

public class PublicRepoResponse {

    private Integer repoId;
    private String repoName;
    private String owner;
    private int openIssuesCount;

    public PublicRepoResponse() {
    }

    public PublicRepoResponse(Integer repoId, String repoName, String owner, int openIssuesCount) {
        this.repoId = repoId;
        this.repoName = repoName;
        this.owner = owner;
        this.openIssuesCount = openIssuesCount;
    }

    public void setRepoId(Integer repoId) {
        this.repoId = repoId;
    }

    public void setRepoName(String repoName) {
        this.repoName = repoName;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public void setOpenIssuesCount(int openIssuesCount) {
        this.openIssuesCount = openIssuesCount;
    }

    public Integer getRepoId() {
        return repoId;
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
