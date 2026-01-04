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

import java.io.FileWriter;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

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

        @Autowired
        private LoggedInUserUtil loggedInUserUtil;

        private final RestTemplate restTemplate = new RestTemplate();

        // ============================
        // STEP 1: START OAUTH
        // ============================
        @GetMapping("/start")
        public ResponseEntity<Void> startOAuth(
                        @RequestParam(value = "token", required = false) String jwtToken,
                        jakarta.servlet.http.HttpServletRequest request) {

                String token = jwtToken;

                // Try to get from cookies if param is missing
                if (token == null || token.isEmpty()) {
                        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
                        if (cookies != null) {
                                for (jakarta.servlet.http.Cookie cookie : cookies) {
                                        if ("token".equals(cookie.getName())) {
                                                token = cookie.getValue();
                                                break;
                                        }
                                }
                        }
                }

                System.out.println("DEBUG: GitHub OAuth start request received with token: "
                                + (token != null ? token.substring(0, 10) : "null") + "...");

                logToFile("DEBUG: GitHub OAuth start request. Token provided: " + (token != null));

                // ✅ Validate JWT early
                if (token == null || !jwtUtil.validateToken(token)) {
                        logToFile("ERROR: JWT Validation FAILED for GitHub OAuth start");
                        return ResponseEntity.status(HttpStatus.FOUND)
                                        .location(URI.create(
                                                        "http://localhost:3000/dashboard?status=error&message=Invalid+session+token"))
                                        .build();
                }

                logToFile("DEBUG: JWT Validation SUCCESS for GitHub OAuth start");

                String githubAuthUrl = "https://github.com/login/oauth/authorize" +
                                "?client_id=" + config.getClientId() +
                                "&redirect_uri=" + URLEncoder.encode(config.getRedirectUri(), StandardCharsets.UTF_8) +
                                "&scope=repo,user" +
                                "&state=" + token;

                logToFile("DEBUG: Redirecting to GitHub: " + githubAuthUrl);

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

                logToFile("DEBUG: GitHub OAuth callback received. Code: " +
                                (code.length() > 5 ? code.substring(0, 5) : code) + "...");

                try {
                        // 1️⃣ Extract email from JWT
                        String email = jwtUtil.extractEmail(jwtToken);
                        logToFile("DEBUG: Extracted email from state: " + email);

                        User user = userRepository.findByEmail(email)
                                        .orElseThrow(() -> new RuntimeException("User not found for OAuth: " + email));

                        // 2️⃣ Exchange code → access token
                        String tokenUrl = "https://github.com/login/oauth/access_token";

                        HttpHeaders tokenHeaders = new HttpHeaders();
                        tokenHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));

                        HttpEntity<Map<String, String>> tokenRequest = new HttpEntity<>(Map.of(
                                        "client_id", config.getClientId(),
                                        "client_secret", config.getClientSecret(),
                                        "code", code), tokenHeaders);

                        Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, tokenRequest,
                                        Map.class);

                        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
                                logToFile("ERROR: Failed to get access token. Response: " + tokenResponse);
                                throw new RuntimeException("GitHub access token not received");
                        }

                        String accessToken = (String) tokenResponse.get("access_token");
                        logToFile("DEBUG: Received access token from GitHub");

                        // 3️⃣ Fetch GitHub user info
                        HttpHeaders userHeaders = new HttpHeaders();
                        userHeaders.setBearerAuth(accessToken);

                        ResponseEntity<Map> userResponse = restTemplate.exchange(
                                        "https://api.github.com/user",
                                        HttpMethod.GET,
                                        new HttpEntity<>(userHeaders),
                                        Map.class);

                        Map githubUser = userResponse.getBody();
                        logToFile("DEBUG: Fetched GitHub user info for: " + githubUser.get("login"));

                        // 4️⃣ Save / Update github_auth
                        GithubAuth auth = githubAuthRepository
                                        .findByUser(user)
                                        .orElse(new GithubAuth());

                        auth.setUser(user);
                        auth.setGithubUserId(((Number) githubUser.get("id")).longValue());
                        auth.setGithubUsername((String) githubUser.get("login"));
                        auth.setGithubEmail((String) githubUser.get("email"));
                        auth.setAvatarUrl((String) githubUser.get("avatar_url"));
                        auth.setAccessToken(accessToken);
                        auth.setUpdatedAt(LocalDateTime.now());

                        githubAuthRepository.save(auth);
                        logToFile("DEBUG: Saved/Updated GitHub auth for user: " + user.getEmail());

                        // ✅ Redirect back to frontend dashboard
                        return ResponseEntity.status(HttpStatus.FOUND)
                                        .location(URI.create(
                                                        "http://localhost:3000/dashboard?status=success&message=GitHub+Connected"))
                                        .build();

                } catch (Exception e) {
                        String errMsg = e.getMessage();
                        if (errMsg == null)
                                errMsg = e.getClass().getSimpleName();

                        logToFile("ERROR: GitHub OAuth callback failed: " + errMsg);
                        e.printStackTrace();

                        return ResponseEntity.status(HttpStatus.FOUND)
                                        .location(URI.create("http://localhost:3000/dashboard?status=error&message=" +
                                                        URLEncoder.encode(errMsg, StandardCharsets.UTF_8)))
                                        .build();
                }
        }

        private void logToFile(String message) {
                try (FileWriter fw = new FileWriter("oauth_debug.log", true);
                                PrintWriter pw = new PrintWriter(fw)) {
                        pw.println(LocalDateTime.now() + " - " + message);
                } catch (Exception e) {
                        System.err.println("Failed to log to file: " + e.getMessage());
                }
        }

        // ============================
        // STEP 3: GET CONNECTED USER INFO
        // ============================
        @GetMapping("/user")
        public ResponseEntity<?> getConnectedUser() {
                User user = loggedInUserUtil.getLoggedInUser();
                Optional<GithubAuth> auth = githubAuthRepository.findByUser(user);

                if (auth.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(Map.of("message", "GitHub not connected"));
                }

                GithubAuth gAuth = auth.get();
                Map<String, Object> info = new HashMap<>();
                info.put("githubUsername", gAuth.getGithubUsername());
                info.put("avatarUrl", gAuth.getAvatarUrl());
                info.put("githubEmail", gAuth.getGithubEmail());
                info.put("connected", true);

                return ResponseEntity.ok(info);
        }

        // ============================
        // STEP 4: FETCH REPOSITORIES
        // ============================
        @GetMapping("/repositories")
        public ResponseEntity<?> getUserRepositories() {
                User user = loggedInUserUtil.getLoggedInUser();
                GithubAuth auth = githubAuthRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("GitHub not connected"));

                String reposUrl = "https://api.github.com/user/repos?per_page=100&sort=updated";

                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(auth.getAccessToken());

                try {
                        ResponseEntity<List> response = restTemplate.exchange(
                                        reposUrl,
                                        HttpMethod.GET,
                                        new HttpEntity<>(headers),
                                        List.class);

                        return ResponseEntity.ok(response.getBody());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Map.of("message", "Failed to fetch repositories: " + e.getMessage()));
                }
        }
}
