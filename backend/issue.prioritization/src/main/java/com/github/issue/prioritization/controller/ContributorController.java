package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.GithubAuth;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.GithubAuthRepository;
import com.github.issue.prioritization.repository.RepositoryRepository;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/repo")
public class ContributorController {

    @Autowired
    private LoggedInUserUtil loggedInUserUtil;

    @Autowired
    private GithubAuthRepository githubAuthRepository;

    @Autowired
    private RepositoryRepository repositoryRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders buildGithubHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.add("User-Agent", "IssuePrioritizationApp");
        headers.add("Accept", "application/vnd.github.v3+json");
        return headers;
    }

    private GithubAuth getGithubAuth() {
        User user = loggedInUserUtil.getLoggedInUser();
        return githubAuthRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("GitHub not connected"));
    }

    private Repository getRepository(Long repoId) {
        return repositoryRepository.findById(Math.toIntExact(repoId))
                .orElseThrow(() -> new RuntimeException("Repository not found: " + repoId));
    }

    // GET /api/repo/{repoId}/contributors
    @GetMapping("/{repoId}/contributors")
    public ResponseEntity<?> getContributors(@PathVariable Long repoId) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format(
                    "https://api.github.com/repos/%s/%s/contributors?per_page=50&anon=false",
                    repo.getRepoOwner(), repo.getRepoName());

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch contributors: " + e.getMessage()));
        }
    }

    // GET /api/repo/{repoId}/activity
    @GetMapping("/{repoId}/activity")
    public ResponseEntity<?> getRecentActivity(@PathVariable Long repoId) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);

            // Fetch recent events
            String eventsUrl = String.format(
                    "https://api.github.com/repos/%s/%s/events?per_page=30",
                    repo.getRepoOwner(), repo.getRepoName());

            ResponseEntity<List<Map<String, Object>>> eventsResponse = restTemplate.exchange(
                    eventsUrl, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return ResponseEntity.ok(eventsResponse.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch activity: " + e.getMessage()));
        }
    }

    // GET /api/repo/{repoId}/team-stats
    @GetMapping("/{repoId}/team-stats")
    public ResponseEntity<?> getTeamStats(@PathVariable Long repoId) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            HttpHeaders headers = buildGithubHeaders(auth.getAccessToken());
            HttpEntity<Void> httpEntity = new HttpEntity<>(headers);

            // Commit activity (last 52 weeks)
            String commitActivityUrl = String.format(
                    "https://api.github.com/repos/%s/%s/stats/commit_activity",
                    repo.getRepoOwner(), repo.getRepoName());
            ResponseEntity<List<Map<String, Object>>> commitActivity = restTemplate.exchange(
                    commitActivityUrl, HttpMethod.GET, httpEntity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Contributors stats
            String contribStatsUrl = String.format(
                    "https://api.github.com/repos/%s/%s/stats/contributors",
                    repo.getRepoOwner(), repo.getRepoName());
            ResponseEntity<List<Map<String, Object>>> contribStats = restTemplate.exchange(
                    contribStatsUrl, HttpMethod.GET, httpEntity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Code frequency
            String codeFreqUrl = String.format(
                    "https://api.github.com/repos/%s/%s/stats/code_frequency",
                    repo.getRepoOwner(), repo.getRepoName());
            ResponseEntity<List<List<Object>>> codeFreq = restTemplate.exchange(
                    codeFreqUrl, HttpMethod.GET, httpEntity,
                    new ParameterizedTypeReference<List<List<Object>>>() {});

            Map<String, Object> result = new HashMap<>();
            result.put("commitActivity", commitActivity.getBody());
            result.put("contributorStats", contribStats.getBody());
            result.put("codeFrequency", codeFreq.getBody());
            result.put("repoOwner", repo.getRepoOwner());
            result.put("repoName", repo.getRepoName());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch team stats: " + e.getMessage()));
        }
    }
}
