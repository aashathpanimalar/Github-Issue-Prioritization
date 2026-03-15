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
public class BranchController {

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

    // GET /api/repo/{repoId}/branches
    @GetMapping("/{repoId}/branches")
    public ResponseEntity<?> getBranches(@PathVariable Long repoId) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format("https://api.github.com/repos/%s/%s/branches?per_page=100",
                    repo.getRepoOwner(), repo.getRepoName());

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch branches: " + e.getMessage()));
        }
    }

    // GET /api/repo/{repoId}/branches/{branch}/commits
    @GetMapping("/{repoId}/branches/{branch}/commits")
    public ResponseEntity<?> getBranchCommits(@PathVariable Long repoId,
                                               @PathVariable String branch,
                                               @RequestParam(defaultValue = "1") int page) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format(
                    "https://api.github.com/repos/%s/%s/commits?sha=%s&per_page=20&page=%d",
                    repo.getRepoOwner(), repo.getRepoName(), branch, page);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch commits: " + e.getMessage()));
        }
    }

    // GET /api/repo/{repoId}/compare/{base}...{head}
    @GetMapping("/{repoId}/compare/{base}...{head}")
    public ResponseEntity<?> compareBranches(@PathVariable Long repoId,
                                              @PathVariable String base,
                                              @PathVariable String head) {
        try {
            GithubAuth auth = getGithubAuth();
            Repository repo = getRepository(repoId);
            String url = String.format(
                    "https://api.github.com/repos/%s/%s/compare/%s...%s",
                    repo.getRepoOwner(), repo.getRepoName(), base, head);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(buildGithubHeaders(auth.getAccessToken())),
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to compare branches: " + e.getMessage()));
        }
    }
}
