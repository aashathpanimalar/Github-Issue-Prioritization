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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repo")
public class PullRequestController {

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

    // GET /api/repo/{repoId}/pull-requests?state=open|closed|all
    @GetMapping("/{repoId}/pull-requests")
    public ResponseEntity<?> getPullRequests(@PathVariable Long repoId,
                                              @RequestParam(defaultValue = "all") String state,
                                              @RequestParam(defaultValue = "1") int page) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format(
                    "https://api.github.com/repos/%s/%s/pulls?state=%s&per_page=30&page=%d&sort=updated",
                    repo.getRepoOwner(), repo.getRepoName(), state, page);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch pull requests: " + e.getMessage()));
        }
    }

    // GET /api/repo/{repoId}/pull-requests/{prNumber}
    @GetMapping("/{repoId}/pull-requests/{prNumber}")
    public ResponseEntity<?> getPullRequestDetail(@PathVariable Long repoId,
                                                   @PathVariable int prNumber) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);

            // Fetch PR details
            String prUrl = String.format("https://api.github.com/repos/%s/%s/pulls/%d",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);
            ResponseEntity<Map<String, Object>> prResponse = restTemplate.exchange(
                    prUrl, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            // Fetch PR files
            String filesUrl = String.format("https://api.github.com/repos/%s/%s/pulls/%d/files",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);
            ResponseEntity<List<Map<String, Object>>> filesResponse = restTemplate.exchange(
                    filesUrl, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Fetch PR reviews
            String reviewsUrl = String.format("https://api.github.com/repos/%s/%s/pulls/%d/reviews",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);
            ResponseEntity<List<Map<String, Object>>> reviewsResponse = restTemplate.exchange(
                    reviewsUrl, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            // Fetch PR comments
            String commentsUrl = String.format("https://api.github.com/repos/%s/%s/issues/%d/comments",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);
            ResponseEntity<List<Map<String, Object>>> commentsResponse = restTemplate.exchange(
                    commentsUrl, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            Map<String, Object> result = new java.util.HashMap<>(prResponse.getBody());
            result.put("files", filesResponse.getBody());
            result.put("reviews", reviewsResponse.getBody());
            result.put("comments", commentsResponse.getBody());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch PR detail: " + e.getMessage()));
        }
    }

    // POST /api/repo/{repoId}/pull-requests/{prNumber}/review
    @PostMapping("/{repoId}/pull-requests/{prNumber}/review")
    public ResponseEntity<?> submitReview(@PathVariable Long repoId,
                                          @PathVariable int prNumber,
                                          @RequestBody Map<String, String> body) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format("https://api.github.com/repos/%s/%s/pulls/%d/reviews",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);

            Map<String, String> payload = Map.of(
                    "body", body.getOrDefault("body", ""),
                    "event", body.getOrDefault("event", "COMMENT")
            );

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST,
                    new HttpEntity<>(payload, buildGithubHeaders(auth.getAccessToken())),
                    Map.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to submit review: " + e.getMessage()));
        }
    }

    // POST /api/repo/{repoId}/pull-requests/{prNumber}/merge
    @PostMapping("/{repoId}/pull-requests/{prNumber}/merge")
    public ResponseEntity<?> mergePR(@PathVariable Long repoId,
                                     @PathVariable int prNumber,
                                     @RequestBody Map<String, String> body) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format("https://api.github.com/repos/%s/%s/pulls/%d/merge",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);

            Map<String, String> payload = Map.of(
                    "commit_title", body.getOrDefault("commit_title", "Merge pull request"),
                    "commit_message", body.getOrDefault("commit_message", ""),
                    "merge_method", body.getOrDefault("merge_method", "merge")
            );

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.PUT,
                    new HttpEntity<>(payload, buildGithubHeaders(auth.getAccessToken())),
                    Map.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to merge PR: " + e.getMessage()));
        }
    }

    // POST /api/repo/{repoId}/pull-requests/{prNumber}/comment
    @PostMapping("/{repoId}/pull-requests/{prNumber}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long repoId,
                                        @PathVariable int prNumber,
                                        @RequestBody Map<String, String> body) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format("https://api.github.com/repos/%s/%s/issues/%d/comments",
                    repo.getRepoOwner(), repo.getRepoName(), prNumber);

            Map<String, String> payload = Map.of("body", body.getOrDefault("body", ""));

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST,
                    new HttpEntity<>(payload, buildGithubHeaders(auth.getAccessToken())),
                    Map.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to add comment: " + e.getMessage()));
        }
    }
}
