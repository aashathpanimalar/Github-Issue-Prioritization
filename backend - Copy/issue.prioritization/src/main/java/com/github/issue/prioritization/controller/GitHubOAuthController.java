package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.config.GitHubOAuthConfig;
import com.github.issue.prioritization.entity.GithubAuth;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.GithubAuthRepository;
import com.github.issue.prioritization.util.LoggedInUserUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/github/oauth")
public class GitHubOAuthController {

    @Autowired
    private GitHubOAuthConfig config;

    @Autowired
    private GithubAuthRepository githubAuthRepository;

    @Autowired
    private LoggedInUserUtil loggedInUserUtil;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/callback")
    public ResponseEntity<?> githubCallback(@RequestParam String code) {

        // 1️⃣ Exchange code → access token
        String tokenUrl = "https://github.com/login/oauth/access_token";

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setAccept(MediaType.parseMediaTypes("application/json"));

        HttpEntity<Map<String, String>> tokenRequest = new HttpEntity<>(
                Map.of(
                        "client_id", config.getClientId(),
                        "client_secret", config.getClientSecret(),
                        "code", code
                ),
                tokenHeaders
        );

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                tokenUrl,
                tokenRequest,
                Map.class
        );

        String accessToken = (String) tokenResponse.getBody().get("access_token");
        String scope = (String) tokenResponse.getBody().get("scope");

        if (accessToken == null) {
            throw new RuntimeException("GitHub access token not received");
        }

        // 2️⃣ Call GitHub USER API
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);

        HttpEntity<Void> userEntity = new HttpEntity<>(userHeaders);

        ResponseEntity<Map> userResponse = restTemplate.exchange(
                "https://api.github.com/user",
                HttpMethod.GET,
                userEntity,
                Map.class
        );

        Map<String, Object> githubUser = userResponse.getBody();

        Long githubUserId = ((Number) githubUser.get("id")).longValue();
        String githubUsername = (String) githubUser.get("login");
        String githubEmail = (String) githubUser.get("email");
        String avatarUrl = (String) githubUser.get("avatar_url");

        // 3️⃣ Get logged-in app user (JWT)
        User user = loggedInUserUtil.getLoggedInUser();

        // 4️⃣ Save / Update github_auth
        GithubAuth auth = githubAuthRepository
                .findByUser(user)
                .orElse(new GithubAuth());

        auth.setUser(user);
        auth.setGithubUserId(githubUserId);
        auth.setGithubUsername(githubUsername);
        auth.setGithubEmail(githubEmail);
        auth.setAvatarUrl(avatarUrl);
        auth.setAccessToken(accessToken);
        auth.setTokenScope(scope);
        auth.setUpdatedAt(LocalDateTime.now());

        githubAuthRepository.save(auth);

        return ResponseEntity.ok(
                Map.of("message", "GitHub account connected successfully")
        );
    }

    @GetMapping("/start")
    public ResponseEntity<Void> startOAuth(
            @RequestParam("token") String jwtToken) {

        String githubAuthUrl =
                "https://github.com/login/oauth/authorize" +
                        "?client_id=" + config.getClientId() +
                        "&redirect_uri=" + config.getRedirectUri() +
                        "&scope=repo" +
                        "&state=" + jwtToken; // ✅ IMPORTANT

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(githubAuthUrl));

        return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();
    }

}
