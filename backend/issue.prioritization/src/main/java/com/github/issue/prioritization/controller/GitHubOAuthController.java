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
                        @RequestParam(value = "mode", defaultValue = "connect") String mode,
                        jakarta.servlet.http.HttpServletRequest request) {

                String state = mode;

                if ("connect".equals(mode)) {
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

                        // ✅ Validate JWT for connect mode
                        if (token == null || !jwtUtil.validateToken(token)) {
                                logToFile("ERROR: JWT Validation FAILED for GitHub OAuth connect");
                                return ResponseEntity.status(HttpStatus.FOUND)
                                                .location(URI.create(
                                                                "http://localhost:3000/dashboard?status=error&message=Invalid+session+token"))
                                                .build();
                        }
                        state = "connect:" + token;
                }

                String githubAuthUrl = "https://github.com/login/oauth/authorize" +
                                "?client_id=" + config.getClientId() +
                                "&redirect_uri=" + URLEncoder.encode(config.getRedirectUri(), StandardCharsets.UTF_8) +
                                "&scope=repo,user,user:email" +
                                "&state=" + state;

                logToFile("DEBUG: Redirecting to GitHub: " + githubAuthUrl);

                return ResponseEntity.status(HttpStatus.FOUND)
                                .location(URI.create(githubAuthUrl))
                                .build();
        }

        // ============================
        // STEP 2: CALLBACK
        // ============================
        @GetMapping("/callback")
        public ResponseEntity<?> githubCallback(
                        @RequestParam("code") String code,
                        @RequestParam("state") String state) {

                logToFile("DEBUG: GitHub OAuth callback received. State: " + state);

                try {
                        String mode = state.startsWith("connect:") ? "connect" : "login";
                        String jwtToken = mode.equals("connect") ? state.substring(8) : null;

                        // 1️⃣ Exchange code → access token
                        String tokenUrl = "https://github.com/login/oauth/access_token";
                        HttpHeaders tokenHeaders = new HttpHeaders();
                        tokenHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));
                        // GitHub requires a User-Agent header
                        tokenHeaders.add("User-Agent", "IssuePrioritizationApp");

                        HttpEntity<Map<String, String>> tokenRequest = new HttpEntity<>(Map.of(
                                        "client_id", config.getClientId(),
                                        "client_secret", config.getClientSecret(),
                                        "code", code), tokenHeaders);

                        logToFile("DEBUG: Requesting access token from: " + tokenUrl);
                        @SuppressWarnings("unchecked")
                        Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, tokenRequest,
                                        Map.class);

                        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
                                logToFile("ERROR: Failed to get access token. Response: " + tokenResponse);
                                throw new RuntimeException("GitHub access token not received");
                        }

                        String accessToken = (String) tokenResponse.get("access_token");
                        logToFile("DEBUG: Access token received successfully.");

                        // 2️⃣ Fetch GitHub user info
                        HttpHeaders userHeaders = new HttpHeaders();
                        userHeaders.setBearerAuth(accessToken);
                        userHeaders.add("User-Agent", "IssuePrioritizationApp");

                        logToFile("DEBUG: Fetching user info from https://api.github.com/user");
                        ResponseEntity<Map> userResponse = restTemplate.exchange(
                                        "https://api.github.com/user",
                                        HttpMethod.GET,
                                        new HttpEntity<>(userHeaders),
                                        Map.class);

                        @SuppressWarnings("unchecked")
                        Map<String, Object> githubUser = userResponse.getBody();
                        Long githubId = ((Number) githubUser.get("id")).longValue();
                        String githubLogin = (String) githubUser.get("login");
                        logToFile("DEBUG: User info received for: " + githubLogin);

                        // 3️⃣ Fetch/Identify User
                        User user = null;
                        if (mode.equals("connect")) {
                                String userEmail = jwtUtil.extractEmail(jwtToken);
                                user = userRepository.findByEmail(userEmail)
                                                .orElseThrow(() -> new RuntimeException(
                                                                "User not found: " + userEmail));
                        } else {
                                // Login/Signup mode: Try to find by GitHub user ID first
                                Optional<GithubAuth> existingAuth = githubAuthRepository.findByGithubUserId(githubId);
                                if (existingAuth.isPresent()) {
                                        user = existingAuth.get().getUser();
                                } else {
                                        // Need to find by email or create new
                                        String email = (String) githubUser.get("email");
                                        if (email == null) {
                                                // Fetch emails via API if not public
                                                logToFile("DEBUG: Email not public, fetching from /user/emails");
                                                ResponseEntity<List> emailsResponse = restTemplate.exchange(
                                                                "https://api.github.com/user/emails",
                                                                HttpMethod.GET,
                                                                new HttpEntity<>(userHeaders),
                                                                List.class);
                                                @SuppressWarnings("unchecked")
                                                List<Map<String, Object>> emails = emailsResponse.getBody();
                                                if (emails != null) {
                                                        for (Map<String, Object> emailObj : emails) {
                                                                if (Boolean.TRUE.equals(emailObj.get("primary"))) {
                                                                        email = (String) emailObj.get("email");
                                                                        break;
                                                                }
                                                        }
                                                }
                                        }

                                        if (email == null) {
                                                throw new RuntimeException("Could not retrieve email from GitHub");
                                        }

                                        user = userRepository.findByEmail(email).orElse(null);
                                        if (user == null) {
                                                // Signup new user
                                                user = new User();
                                                user.setEmail(email);
                                                user.setName(githubLogin);
                                                user.setEmailVerified(true);
                                                user = userRepository.save(user);
                                                logToFile("DEBUG: Created new user for GitHub signup: " + email);
                                        }
                                }
                        }

                        // 4️⃣ Update GithubAuth
                        GithubAuth auth = githubAuthRepository.findByUser(user).orElse(new GithubAuth());
                        auth.setUser(user);
                        auth.setGithubUserId(githubId);
                        auth.setGithubUsername(githubLogin);
                        auth.setAvatarUrl((String) githubUser.get("avatar_url"));
                        auth.setAccessToken(accessToken);
                        auth.setUpdatedAt(LocalDateTime.now());
                        githubAuthRepository.save(auth);

                        // 5️⃣ Generate Token for session
                        String finalToken = jwtUtil.generateToken(user.getEmail());

                        // 6️⃣ Redirect back with token and user info
                        String targetUrl = "http://localhost:3000/callback" +
                                        "?token=" + finalToken +
                                        "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8) +
                                        "&name=" + URLEncoder.encode(user.getName(), StandardCharsets.UTF_8);

                        logToFile("DEBUG: Redirecting to frontend: " + targetUrl);
                        return ResponseEntity.status(HttpStatus.FOUND)
                                        .location(URI.create(targetUrl))
                                        .build();

                } catch (Exception e) {
                        logToFile("ERROR: GitHub OAuth callback failed: " + e.getMessage());
                        // e.printStackTrace(); // Optional: Print stack trace to console
                        return ResponseEntity.status(HttpStatus.FOUND)
                                        .location(URI.create("http://localhost:3000/login?status=error&message=" +
                                                        URLEncoder.encode(
                                                                        e.getMessage() != null ? e.getMessage()
                                                                                        : "Unknown Error",
                                                                        StandardCharsets.UTF_8)))
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
