package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PublicRepoRequest;
import com.github.issue.prioritization.dto.PublicRepoResponse;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.exception.InvalidOrPrivateRepoException;
import com.github.issue.prioritization.repository.RepositoryRepository;
import com.github.issue.prioritization.repository.GithubAuthRepository;
import com.github.issue.prioritization.repository.UserRepository;
import com.github.issue.prioritization.service.*;
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

    // 🔥 REUSED SERVICES (already implemented)
    @Autowired
    private IssueFetchService issueFetchService;

    @Autowired
    private IssueAnalysisService issueAnalysisService;

    @Autowired
    private DuplicateIssueService duplicateIssueService;

    @Autowired
    private GithubAuthRepository githubAuthRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public PublicRepoResponse analyzePublicRepo(PublicRepoRequest request) {

        // ===============================
        // 1️⃣ Parse & validate URL
        // ===============================
        String inputUrl = request.getRepoUrl().trim();
        String cleanUrl = inputUrl
                .replace("https://", "")
                .replace("http://", "")
                .replace("github.com/", "");

        // Remove trailing slash if present
        if (cleanUrl.endsWith("/")) {
            cleanUrl = cleanUrl.substring(0, cleanUrl.length() - 1);
        }

        String[] parts = cleanUrl.split("/");
        if (parts.length < 2) {
            throw new InvalidOrPrivateRepoException("Invalid GitHub repository URL. Format: owner/repo");
        }

        String owner = parts[0];
        String repo = parts[1];

        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo;

        // ===============================
        // 🔐 Check for Context Token
        // ===============================
        String accessToken = null;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = (String) auth.getPrincipal();
                // Assuming Principal is email (set by JwtFilter)
                // If it's not email, adjust based on JwtFilter implementation.
                // Based on UserProfileController logic, it seems we can get user by email.

                com.github.issue.prioritization.entity.User user = userRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    com.github.issue.prioritization.entity.GithubAuth githubAuth = githubAuthRepository.findByUser(user)
                            .orElse(null);
                    if (githubAuth != null) {
                        accessToken = githubAuth.getAccessToken();
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Warning: Could not retrieve user context: " + e.getMessage());
        }

        try {
            // ===============================
            // 2️⃣ Call GitHub Public API
            // ===============================
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            headers.set("User-Agent", "Issue-Prioritization-App");

            if (accessToken != null) {
                headers.setBearerAuth(accessToken);
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class);

            Map<String, Object> response = responseEntity.getBody();
            if (response == null) {
                throw new InvalidOrPrivateRepoException("Empty GitHub response");
            }

            // ===============================
            // 3️⃣ Ensure PUBLIC repository
            // ===============================
            Boolean isPrivate = (Boolean) response.get("private");
            if (Boolean.TRUE.equals(isPrivate)) {
                throw new InvalidOrPrivateRepoException(
                        "This is a private repository. Use private repo option.");
            }

            String repoName = (String) response.get("name");
            int openIssues = response.get("open_issues_count") != null
                    ? ((Number) response.get("open_issues_count")).intValue()
                    : 0;

            // ===============================
            // 4️⃣ Save or get repository
            // ===============================
            Repository repository = repositoryRepository
                    .findByRepoOwnerAndRepoNameAndRepoType(owner, repoName, "PUBLIC")
                    .orElseGet(() -> {
                        Repository newRepo = new Repository();
                        newRepo.setUser(null); // PUBLIC repo
                        newRepo.setRepoOwner(owner);
                        newRepo.setRepoName(repoName);
                        newRepo.setRepoUrl(request.getRepoUrl());
                        newRepo.setRepoType("PUBLIC");
                        return newRepo;
                    });

            repository.setAnalyzedAt(LocalDateTime.now());
            repository = repositoryRepository.save(repository);

            // ===============================
            // 🔥 5️⃣ FULL PIPELINE EXECUTION
            // ===============================
            issueFetchService.fetchAndStoreIssuesWithToken(repository.getRepoId(), accessToken);
            issueAnalysisService.analyzeIssues(repository.getRepoId());
            duplicateIssueService.detectDuplicates(repository.getRepoId());

            // ===============================
            // 6️⃣ Response
            // ===============================
            return new PublicRepoResponse(
                    repository.getRepoId(),
                    repoName,
                    owner,
                    openIssues);

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
