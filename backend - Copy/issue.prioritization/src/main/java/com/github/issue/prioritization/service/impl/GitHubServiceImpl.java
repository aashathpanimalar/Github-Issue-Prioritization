package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PublicRepoRequest;
import com.github.issue.prioritization.dto.PublicRepoResponse;
import com.github.issue.prioritization.exception.InvalidOrPrivateRepoException;
import com.github.issue.prioritization.service.GitHubService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GitHubServiceImpl implements GitHubService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public PublicRepoResponse analyzePublicRepo(PublicRepoRequest request) {

        String repoUrl = request.getRepoUrl();
        String[] parts = repoUrl.replace("https://github.com/", "").split("/");

        if (parts.length < 2) {
            throw new InvalidOrPrivateRepoException(
                    "Invalid GitHub repository URL / Private Repository"
            );
        }

        String owner = parts[0];
        String repo = parts[1];

        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo;

        try {
            Map<String, Object> response =
                    restTemplate.getForObject(apiUrl, Map.class);

            String repoName = (String) response.get("name");
            int openIssues =
                    response.get("open_issues_count") != null
                            ? (Integer) response.get("open_issues_count")
                            : 0;

            return new PublicRepoResponse(repoName, owner, openIssues);

        } catch (HttpClientErrorException e) {

            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new InvalidOrPrivateRepoException(
                        "Invalid GitHub repository URL / Private Repository"
                );
            }

            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new InvalidOrPrivateRepoException(
                        "GitHub API rate limit exceeded"
                );
            }

            throw new InvalidOrPrivateRepoException(
                    "Invalid GitHub repository URL / Private Repository"
            );
        }
    }
}
