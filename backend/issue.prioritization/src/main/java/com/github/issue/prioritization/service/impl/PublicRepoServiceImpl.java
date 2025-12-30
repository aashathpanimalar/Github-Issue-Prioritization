package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PublicRepoRequest;
import com.github.issue.prioritization.dto.PublicRepoResponse;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.exception.InvalidOrPrivateRepoException;
import com.github.issue.prioritization.repository.RepositoryRepository;
import com.github.issue.prioritization.service.PublicRepoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PublicRepoServiceImpl implements PublicRepoService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Override
    public PublicRepoResponse analyzePublicRepo(PublicRepoRequest request) {

        String cleanUrl = request.getRepoUrl()
                .replace("https://github.com/", "")
                .replaceAll("/$", "");

        String[] parts = cleanUrl.split("/");
        if (parts.length < 2) {
            throw new InvalidOrPrivateRepoException("Invalid GitHub repository URL");
        }

        String owner = parts[0];
        String repo = parts[1];

        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            headers.set("User-Agent", "Issue-Prioritization-App");

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> response = responseEntity.getBody();
            if (response == null) {
                throw new InvalidOrPrivateRepoException("Empty GitHub response");
            }

            String repoName = (String) response.get("name");
            int openIssues = response.get("open_issues_count") != null
                    ? ((Number) response.get("open_issues_count")).intValue()
                    : 0;

            Repository repository = new Repository();
            repository.setUser(null); // PUBLIC repo
            repository.setRepoOwner(owner);
            repository.setRepoName(repoName);
            repository.setRepoUrl(request.getRepoUrl());
            repository.setRepoType("PUBLIC");
            repository.setAnalyzedAt(LocalDateTime.now());

            repositoryRepository.save(repository);

            return new PublicRepoResponse(repoName, owner, openIssues);

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new InvalidOrPrivateRepoException("Repository not found");
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new InvalidOrPrivateRepoException("GitHub API rate limit exceeded");
            }
            throw new InvalidOrPrivateRepoException("GitHub API error");
        }
    }
}
