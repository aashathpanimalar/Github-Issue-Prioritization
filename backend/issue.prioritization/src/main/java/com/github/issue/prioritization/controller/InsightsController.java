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
public class InsightsController {

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

    @SuppressWarnings("unchecked")
    private <T> T githubGet(String url, HttpHeaders headers, ParameterizedTypeReference<T> type) {
        return restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), type).getBody();
    }

    // GET /api/repo/{repoId}/health  - Comprehensive project health score
    @GetMapping("/{repoId}/health")
    public ResponseEntity<?> getRepoHealth(@PathVariable Long repoId) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            HttpHeaders headers = buildGithubHeaders(auth.getAccessToken());

            String base = String.format("https://api.github.com/repos/%s/%s", repo.getRepoOwner(), repo.getRepoName());

            // Fetch raw repo info
            Map<String, Object> repoInfo = githubGet(base, headers,
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            // Fetch open issues count
            List<Map<String, Object>> openIssues = githubGet(
                    base + "/issues?state=open&per_page=100", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Fetch closed issues count (last 100)
            List<Map<String, Object>> closedIssues = githubGet(
                    base + "/issues?state=closed&per_page=100", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Fetch open PRs
            List<Map<String, Object>> openPRs = githubGet(
                    base + "/pulls?state=open&per_page=100", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Fetch merged PRs
            List<Map<String, Object>> closedPRs = githubGet(
                    base + "/pulls?state=closed&per_page=100", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Fetch branches
            List<Map<String, Object>> branches = githubGet(
                    base + "/branches?per_page=100", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Calculate health metrics
            int totalIssues = (openIssues != null ? openIssues.size() : 0) +
                              (closedIssues != null ? closedIssues.size() : 0);
            int closedCount = closedIssues != null ? closedIssues.size() : 0;
            int openCount = openIssues != null ? openIssues.size() : 0;
            int totalPRs = (openPRs != null ? openPRs.size() : 0) +
                           (closedPRs != null ? closedPRs.size() : 0);

            double issueCloseRate = totalIssues > 0 ? (double) closedCount / totalIssues * 100 : 0;
            int mergedPRs = 0;
            if (closedPRs != null) {
                mergedPRs = (int) closedPRs.stream()
                        .filter(pr -> pr.get("merged_at") != null)
                        .count();
            }
            double prMergeRate = totalPRs > 0 ? (double) mergedPRs / totalPRs * 100 : 0;

            // Composite health score (0-100)
            int stars = repoInfo != null ? ((Number) repoInfo.getOrDefault("stargazers_count", 0)).intValue() : 0;
            int forks = repoInfo != null ? ((Number) repoInfo.getOrDefault("forks_count", 0)).intValue() : 0;
            int watcherScore = Math.min(20, stars / 5 + forks / 2);
            double healthScore = Math.min(100, (issueCloseRate * 0.3) + (prMergeRate * 0.3) +
                    (branches != null ? Math.min(20, branches.size() * 2) : 0) + watcherScore);

            Map<String, Object> result = new HashMap<>();
            result.put("healthScore", (int) healthScore);
            result.put("openIssues", openCount);
            result.put("closedIssues", closedCount);
            result.put("issueCloseRate", Math.round(issueCloseRate));
            result.put("openPRs", openPRs != null ? openPRs.size() : 0);
            result.put("mergedPRs", mergedPRs);
            result.put("prMergeRate", Math.round(prMergeRate));
            result.put("branches", branches != null ? branches.size() : 0);
            result.put("stars", stars);
            result.put("forks", forks);
            result.put("watchers", repoInfo != null ? repoInfo.getOrDefault("watchers_count", 0) : 0);
            result.put("language", repoInfo != null ? repoInfo.getOrDefault("language", "Unknown") : "Unknown");
            result.put("description", repoInfo != null ? repoInfo.getOrDefault("description", "") : "");
            result.put("defaultBranch", repoInfo != null ? repoInfo.getOrDefault("default_branch", "main") : "main");
            result.put("repoOwner", repo.getRepoOwner());
            result.put("repoName", repo.getRepoName());
            result.put("htmlUrl", repoInfo != null ? repoInfo.getOrDefault("html_url", "") : "");
            result.put("openPRList", openPRs != null ? openPRs.subList(0, Math.min(5, openPRs.size())) : List.of());
            result.put("recentClosedIssues", closedIssues != null ? closedIssues.subList(0, Math.min(5, closedIssues.size())) : List.of());
            result.put("recentOpenIssues", openIssues != null ? openIssues.subList(0, Math.min(5, openIssues.size())) : List.of());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch health: " + e.getMessage()));
        }
    }

    // GET /api/repo/{repoId}/workflow-summary - Full pipeline overview
    @GetMapping("/{repoId}/workflow-summary")
    public ResponseEntity<?> getWorkflowSummary(@PathVariable Long repoId) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            HttpHeaders headers = buildGithubHeaders(auth.getAccessToken());
            String base = String.format("https://api.github.com/repos/%s/%s", repo.getRepoOwner(), repo.getRepoName());

            List<Map<String, Object>> openIssues = githubGet(base + "/issues?state=open&per_page=20", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> openPRs = githubGet(base + "/pulls?state=open&per_page=20", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> closedPRs = githubGet(base + "/pulls?state=closed&per_page=20", headers,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Filter merged from closed PRs
            List<Map<String, Object>> mergedPRs = closedPRs != null
                    ? closedPRs.stream().filter(pr -> pr.get("merged_at") != null).toList()
                    : List.of();

            Map<String, Object> result = new HashMap<>();
            result.put("openIssues", openIssues != null ? openIssues : List.of());
            result.put("openPRs", openPRs != null ? openPRs : List.of());
            result.put("mergedPRs", mergedPRs);
            result.put("repoOwner", repo.getRepoOwner());
            result.put("repoName", repo.getRepoName());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch workflow summary: " + e.getMessage()));
        }
    }
}
