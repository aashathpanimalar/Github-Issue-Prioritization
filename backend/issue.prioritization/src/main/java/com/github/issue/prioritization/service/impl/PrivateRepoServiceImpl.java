
package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PrivateRepoRequest;
import com.github.issue.prioritization.dto.PrivateRepoResponse;
import com.github.issue.prioritization.entity.*;
import com.github.issue.prioritization.exception.InvalidOrPrivateRepoException;
import com.github.issue.prioritization.repository.*;
import com.github.issue.prioritization.service.*;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PrivateRepoServiceImpl implements PrivateRepoService {

    private final RestTemplate restTemplate = new RestTemplate();

    private final GithubAuthRepository githubAuthRepository;
    private final RepositoryRepository repositoryRepository;
    private final IssueFetchService issueFetchService;
    private final IssueAnalysisService issueAnalysisService;
    private final DuplicateIssueService duplicateIssueService;
    private final LoggedInUserUtil loggedInUserUtil;

    public PrivateRepoServiceImpl(
            GithubAuthRepository githubAuthRepository,
            RepositoryRepository repositoryRepository,
            IssueFetchService issueFetchService,
            IssueAnalysisService issueAnalysisService,
            DuplicateIssueService duplicateIssueService,
            LoggedInUserUtil loggedInUserUtil) {

        this.githubAuthRepository = githubAuthRepository;
        this.repositoryRepository = repositoryRepository;
        this.issueFetchService = issueFetchService;
        this.issueAnalysisService = issueAnalysisService;
        this.duplicateIssueService = duplicateIssueService;
        this.loggedInUserUtil = loggedInUserUtil;
    }

    @Override
    public PrivateRepoResponse analyzePrivateRepo(PrivateRepoRequest request) {
        logToFile("DEBUG: Received analyzePrivateRepo request for URL: " + request.getRepoUrl());

        User user = loggedInUserUtil.getLoggedInUser();

        GithubAuth githubAuth = githubAuthRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("GitHub OAuth not connected"));

        // 🔹 Extract owner & repo name
        String cleanUrl = request.getRepoUrl()
                .replace("https://github.com/", "")
                .replaceAll("/$", "");

        String[] parts = cleanUrl.split("/");
        if (parts.length < 2) {
            throw new InvalidOrPrivateRepoException("Invalid GitHub repository URL");
        }

        String owner = parts[0];
        String repoName = parts[1];

        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repoName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(githubAuth.getAccessToken());
        headers.set("User-Agent", "Issue-Prioritization-App");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);

            Map<String, Object> repoData = response.getBody();

            Boolean isPrivate = (Boolean) repoData.get("private");

            // ❌ Public repo entered in private flow
            if (!isPrivate) {
                throw new RuntimeException("This is a public repository. Use public repo option.");
            }

            // ✅ Save or get repository
            Repository repository = repositoryRepository.findByRepoOwnerAndRepoNameAndUser(owner, repoName, user)
                    .orElseGet(() -> {
                        Repository newRepo = new Repository();
                        newRepo.setUser(user);
                        newRepo.setRepoOwner(owner);
                        newRepo.setRepoName(repoName);
                        newRepo.setRepoUrl(request.getRepoUrl());
                        newRepo.setRepoType("PRIVATE");
                        return newRepo;
                    });

            repository.setAnalyzedAt(LocalDateTime.now());
            repository = repositoryRepository.save(repository);

            // ✅ Fetch issues
            issueFetchService.fetchAndStorePrivateIssues(
                    repository.getRepoId(),
                    githubAuth.getAccessToken());

            // ✅ Analyze priority
            issueAnalysisService.analyzeIssues(repository.getRepoId());

            // ✅ Detect duplicates
            duplicateIssueService.detectDuplicates(repository.getRepoId());

            logToFile("SUCCESS: Private repo analysis completed for " + owner + "/" + repoName);

            return new PrivateRepoResponse(repository.getRepoId(), repoName, owner, true);

        } catch (HttpClientErrorException e) {
            logToFile("ERROR: GitHub API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("Repository not found on GitHub");
            }
            throw new RuntimeException("GitHub API error: " + e.getMessage());
        } catch (Exception e) {
            logToFile("ERROR: Unexpected error during analysis: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Operation failed: " + e.getMessage());
        }
    }

    private void logToFile(String message) {
        try (FileWriter fw = new FileWriter("private_repo_debug.log", true);
                PrintWriter pw = new PrintWriter(fw)) {
            pw.println(LocalDateTime.now() + " - " + message);
        } catch (Exception e) {
            System.err.println("Failed to log to file: " + e.getMessage());
        }
    }
}
