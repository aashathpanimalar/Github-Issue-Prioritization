//package com.github.issue.prioritization.service.impl;
//
//import com.github.issue.prioritization.dto.PrivateRepoRequest;
//import com.github.issue.prioritization.dto.PrivateRepoResponse;
//import com.github.issue.prioritization.entity.GithubAuth;
//import com.github.issue.prioritization.repository.GithubAuthRepository;
//import com.github.issue.prioritization.service.PrivateRepoService;
//import com.github.issue.prioritization.util.LoggedInUserUtil;
//
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.Map;
//
//@Service
//public class PrivateRepoServiceImpl implements PrivateRepoService {
//
//    private final GithubAuthRepository githubAuthRepository;
//    private final LoggedInUserUtil loggedInUserUtil;
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public PrivateRepoServiceImpl(
//            GithubAuthRepository githubAuthRepository,
//            LoggedInUserUtil loggedInUserUtil) {
//        this.githubAuthRepository = githubAuthRepository;
//        this.loggedInUserUtil = loggedInUserUtil;
//    }
//
//    @Override
//    public PrivateRepoResponse analyzePrivateRepo(PrivateRepoRequest request) {
//
//        String[] parts = request.getRepoUrl()
//                .replace("https://github.com/", "")
//                .split("/");
//
//        if (parts.length < 2) {
//            throw new RuntimeException("Invalid GitHub repository URL");
//        }
//
//        String owner = parts[0];
//        String repo = parts[1];
//
//        // 🔐 Get OAuth token of logged-in user
//        GithubAuth auth = githubAuthRepository
//                .findByUser(loggedInUserUtil.getLoggedInUser())
//                .orElseThrow(() ->
//                        new RuntimeException("GitHub account not connected"));
//
//        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo;
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setBearerAuth(auth.getAccessToken());
//
//        HttpEntity<Void> entity = new HttpEntity<>(headers);
//
//        ResponseEntity<Map> response = restTemplate.exchange(
//                apiUrl,
//                HttpMethod.GET,
//                entity,
//                Map.class
//        );
//
//        Map<String, Object> body = response.getBody();
//
//        return new PrivateRepoResponse(
//                (String) body.get("name"),
//                owner,
//                (Boolean) body.get("private")
//        );
//    }
//}

package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.PrivateRepoRequest;
import com.github.issue.prioritization.entity.*;
import com.github.issue.prioritization.exception.InvalidOrPrivateRepoException;
import com.github.issue.prioritization.repository.*;
import com.github.issue.prioritization.service.*;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PrivateRepoServiceImpl {

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

    public void analyzePrivateRepo(PrivateRepoRequest request) {

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

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );

            Map<String, Object> repoData = response.getBody();

            Boolean isPrivate = (Boolean) repoData.get("private");
            String repoOwner = ((Map<String, Object>) repoData.get("owner")).get("login").toString();

            // ❌ Public repo entered in private flow
            if (!isPrivate) {
                throw new RuntimeException("This is a public repository. Use public repo option.");
            }

            // ❌ Repo not owned by OAuth user
            if (!repoOwner.equalsIgnoreCase(githubAuth.getGithubUsername())) {
                throw new RuntimeException("You are not authorized to access this private repository");
            }

            // ✅ Save repository
            Repository repository = new Repository();
            repository.setUser(user);
            repository.setRepoOwner(owner);
            repository.setRepoName(repoName);
            repository.setRepoUrl(request.getRepoUrl());
            repository.setRepoType("PRIVATE");
            repository.setAnalyzedAt(LocalDateTime.now());

            repository = repositoryRepository.save(repository);

            // ✅ Fetch issues
            issueFetchService.fetchAndStorePrivateIssues(
                    repository.getRepoId(),
                    githubAuth.getAccessToken()
            );

            // ✅ Analyze priority
            issueAnalysisService.analyzeIssues(repository.getRepoId());

            // ✅ Detect duplicates
            duplicateIssueService.detectDuplicates(repository.getRepoId());

        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("Repository not found on GitHub");
        }
    }
}
