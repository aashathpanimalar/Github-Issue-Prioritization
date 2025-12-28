package com.github.issue.prioritization.dto;

public class PrivateRepoResponse {

    private String repoName;
    private String owner;
    private boolean isPrivate;

    public PrivateRepoResponse(String repoName, String owner, boolean isPrivate) {
        this.repoName = repoName;
        this.owner = owner;
        this.isPrivate = isPrivate;
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
