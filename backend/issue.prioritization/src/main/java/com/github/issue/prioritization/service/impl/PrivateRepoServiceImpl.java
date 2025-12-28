package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PrivateRepoRequest;
import com.github.issue.prioritization.dto.PrivateRepoResponse;
import com.github.issue.prioritization.entity.GithubAuth;
import com.github.issue.prioritization.repository.GithubAuthRepository;
import com.github.issue.prioritization.service.PrivateRepoService;
import com.github.issue.prioritization.util.LoggedInUserUtil;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class PrivateRepoServiceImpl implements PrivateRepoService {

    private final GithubAuthRepository githubAuthRepository;
    private final LoggedInUserUtil loggedInUserUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    public PrivateRepoServiceImpl(
            GithubAuthRepository githubAuthRepository,
            LoggedInUserUtil loggedInUserUtil) {
        this.githubAuthRepository = githubAuthRepository;
        this.loggedInUserUtil = loggedInUserUtil;
    }

    @Override
    public PrivateRepoResponse analyzePrivateRepo(PrivateRepoRequest request) {

        String[] parts = request.getRepoUrl()
                .replace("https://github.com/", "")
                .split("/");

        if (parts.length < 2) {
            throw new RuntimeException("Invalid GitHub repository URL");
        }

        String owner = parts[0];
        String repo = parts[1];

        // 🔐 Get OAuth token of logged-in user
        GithubAuth auth = githubAuthRepository
                .findByUser(loggedInUserUtil.getLoggedInUser())
                .orElseThrow(() ->
                        new RuntimeException("GitHub account not connected"));

        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(auth.getAccessToken());

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> body = response.getBody();

        return new PrivateRepoResponse(
                (String) body.get("name"),
                owner,
                (Boolean) body.get("private")
        );
    }
}
