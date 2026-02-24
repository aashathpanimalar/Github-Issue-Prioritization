package com.github.issue.prioritization.service;

public interface IssueFetchService {
    void fetchAndStoreIssues(Integer repoId);

    void fetchAndStorePrivateIssues(Integer repoId, String accessToken);

    void fetchAndStoreIssuesWithToken(Integer repoId, String accessToken);
}
