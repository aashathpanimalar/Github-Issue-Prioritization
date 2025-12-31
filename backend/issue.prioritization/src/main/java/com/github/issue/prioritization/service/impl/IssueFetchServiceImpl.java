
package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.entity.*;
import com.github.issue.prioritization.repository.*;
import com.github.issue.prioritization.service.IssueFetchService;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class IssueFetchServiceImpl implements IssueFetchService {

    private final RepositoryRepository repositoryRepository;
    private final GithubIssueRepository githubIssueRepository;
    private final GithubAuthRepository githubAuthRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public IssueFetchServiceImpl(
            RepositoryRepository repositoryRepository,
            GithubIssueRepository githubIssueRepository,
            GithubAuthRepository githubAuthRepository) {

        this.repositoryRepository = repositoryRepository;
        this.githubIssueRepository = githubIssueRepository;
        this.githubAuthRepository = githubAuthRepository;
    }

    // ============================
    // EXISTING METHOD (DO NOT CHANGE)
    // ============================
    @Override
    public void fetchAndStoreIssues(Integer repoId) {

        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String apiUrl =
                "https://api.github.com/repos/"
                        + repo.getRepoOwner()
                        + "/" + repo.getRepoName()
                        + "/issues";

        HttpHeaders headers = new HttpHeaders();

        // 🔐 PRIVATE repo handled automatically
        if ("PRIVATE".equalsIgnoreCase(repo.getRepoType())) {

            GithubAuth auth = githubAuthRepository
                    .findByUser(repo.getUser())
                    .orElseThrow(() ->
                            new RuntimeException("GitHub OAuth not connected"));

            headers.setBearerAuth(auth.getAccessToken());
        }

        fetchIssues(apiUrl, headers, repo);
    }

    // ============================
    // 🔥 NEW METHOD (PRIVATE ONLY)
    // ============================
    @Override
    public void fetchAndStorePrivateIssues(
            Integer repoId,
            String accessToken) {

        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String apiUrl =
                "https://api.github.com/repos/"
                        + repo.getRepoOwner()
                        + "/" + repo.getRepoName()
                        + "/issues";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        fetchIssues(apiUrl, headers, repo);
    }

    // ============================
    // SHARED INTERNAL LOGIC
    // ============================
    private void fetchIssues(
            String apiUrl,
            HttpHeaders headers,
            Repository repo) {

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                entity,
                List.class
        );

        List<Map<String, Object>> issues = response.getBody();
        if (issues == null) return;

        for (Map<String, Object> issueData : issues) {

            // ❌ Skip pull requests
            if (issueData.containsKey("pull_request")) continue;

            GithubIssue issue = new GithubIssue();
            issue.setRepository(repo);

            Number number = (Number) issueData.get("number");
            issue.setGithubIssueNumber(number.intValue());

            issue.setTitle((String) issueData.get("title"));

            issue.setDescription(
                    issueData.get("body") != null
                            ? issueData.get("body").toString()
                            : ""
            );

            issue.setIssueState((String) issueData.get("state"));

            if (issueData.get("created_at") != null) {
                issue.setCreatedDate(
                        LocalDateTime.parse(
                                issueData.get("created_at")
                                        .toString()
                                        .replace("Z", "")
                        )
                );
            } else {
                issue.setCreatedDate(LocalDateTime.now());
            }

            githubIssueRepository.save(issue);
        }
    }
}
