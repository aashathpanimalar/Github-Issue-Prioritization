package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.config.GitHubOAuthConfig;
import com.github.issue.prioritization.config.jwt.JwtUtil;
import com.github.issue.prioritization.entity.GithubAuth;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.GithubAuthRepository;
import com.github.issue.prioritization.repository.UserRepository;
import com.github.issue.prioritization.util.LoggedInUserUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github/oauth")
public class GitHubOAuthController {

    @Autowired
    private GitHubOAuthConfig config;

    @Autowired
    private GithubAuthRepository githubAuthRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    // ============================
    // STEP 1: START OAUTH
    // ============================
    @GetMapping("/start")
    public ResponseEntity<Void> startOAuth(
            @RequestParam("token") String jwtToken) {

        // ✅ Validate JWT early
        if (!jwtUtil.validateToken(jwtToken)) {
            throw new RuntimeException("Invalid JWT token");
        }

        String githubAuthUrl =
                "https://github.com/login/oauth/authorize" +
                        "?client_id=" + config.getClientId() +
                        "&redirect_uri=" + config.getRedirectUri() +
                        "&scope=repo" +
                        "&state=" + jwtToken;

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(githubAuthUrl));

        return ResponseEntity.status(HttpStatus.FOUND)
                .headers(headers)
                .build();
    }

    // ============================
    // STEP 2: CALLBACK
    // ============================
    @GetMapping("/callback")
    public ResponseEntity<?> githubCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String jwtToken) {

        // 1️⃣ Extract email from JWT
        String email = jwtUtil.extractEmail(jwtToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for OAuth"));

        // 2️⃣ Exchange code → access token
        String tokenUrl = "https://github.com/login/oauth/access_token";

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Map<String, String>> tokenRequest =
                new HttpEntity<>(Map.of(
                        "client_id", config.getClientId(),
                        "client_secret", config.getClientSecret(),
                        "code", code
                ), tokenHeaders);

        Map<String, Object> tokenResponse =
                restTemplate.postForObject(tokenUrl, tokenRequest, Map.class);

        String accessToken = (String) tokenResponse.get("access_token");

        if (accessToken == null) {
            throw new RuntimeException("GitHub access token not received");
        }

        // 3️⃣ Fetch GitHub user info
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);

        ResponseEntity<Map> userResponse =
                restTemplate.exchange(
                        "https://api.github.com/user",
                        HttpMethod.GET,
                        new HttpEntity<>(userHeaders),
                        Map.class
                );

        Map githubUser = userResponse.getBody();

        // 4️⃣ Save / Update github_auth
        GithubAuth auth = githubAuthRepository
                .findByUser(user)
                .orElse(new GithubAuth());

        auth.setUser(user);
        auth.setGithubUserId(
                ((Number) githubUser.get("id")).longValue()
        );
        auth.setGithubUsername((String) githubUser.get("login"));
        auth.setGithubEmail((String) githubUser.get("email")); // may be null
        auth.setAvatarUrl((String) githubUser.get("avatar_url"));
        auth.setAccessToken(accessToken);
        auth.setUpdatedAt(LocalDateTime.now());

        githubAuthRepository.save(auth);

        return ResponseEntity.ok(
                Map.of("message", "GitHub account connected successfully")
        );
    }
}
