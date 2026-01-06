package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PublicRepoRequest;
import com.github.issue.prioritization.dto.PublicRepoResponse;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.exception.InvalidOrPrivateRepoException;
import com.github.issue.prioritization.repository.RepositoryRepository;
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

    @Override
    public PublicRepoResponse analyzePublicRepo(PublicRepoRequest request) {

        // ===============================
        // 1️⃣ Parse & validate URL
        // ===============================
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
            // ===============================
            // 2️⃣ Call GitHub Public API
            // ===============================
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");
            headers.set("User-Agent", "Issue-Prioritization-App");

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
            issueFetchService.fetchAndStoreIssues(repository.getRepoId());
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
