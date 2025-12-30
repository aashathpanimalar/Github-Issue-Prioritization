package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.entity.GithubIssue;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.repository.GithubIssueRepository;
import com.github.issue.prioritization.repository.RepositoryRepository;
import com.github.issue.prioritization.service.IssueFetchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class IssueFetchServiceImpl implements IssueFetchService {

    @Autowired
    private RepositoryRepository repositoryRepository;

    @Autowired
    private GithubIssueRepository githubIssueRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void fetchAndStoreIssues(Integer repoId) {

        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String apiUrl = "https://api.github.com/repos/"
                + repo.getRepoOwner() + "/" + repo.getRepoName() + "/issues";

        HttpHeaders headers = new HttpHeaders();

        // PUBLIC repo → no token required
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                entity,
                List.class
        );

        List<Map<String, Object>> issues = response.getBody();

        for (Map<String, Object> issueData : issues) {

            // ❌ Skip pull requests
            if (issueData.containsKey("pull_request")) {
                continue;
            }

            GithubIssue issue = new GithubIssue();
            issue.setRepository(repo);
            issue.setGithubIssueNumber((Integer) issueData.get("number"));
            issue.setTitle((String) issueData.get("title"));
            issue.setDescription((String) issueData.get("body"));
            issue.setIssueState((String) issueData.get("state"));
            issue.setCreatedDate(LocalDateTime.now());

            githubIssueRepository.save(issue);
        }
    }
}
