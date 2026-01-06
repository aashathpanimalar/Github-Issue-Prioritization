package com.github.issue.prioritization.dto;

public class PrivateRepoResponse {

    private Integer repoId;
    private String repoName;
    private String owner;
    private boolean isPrivate;

    public PrivateRepoResponse(Integer repoId, String repoName, String owner, boolean isPrivate) {
        this.repoId = repoId;
        this.repoName = repoName;
        this.owner = owner;
        this.isPrivate = isPrivate;
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

    public boolean isPrivate() {
        return isPrivate;
    }
}
