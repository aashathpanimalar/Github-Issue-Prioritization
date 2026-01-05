package com.github.issue.prioritization.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GitHubOAuthConfig {

    @Value("${github.client.id}")
    private String clientId;

    @Value("${github.client.secret}")
    private String clientSecret;

    @Value("${github.redirect.uri}")
    private String redirectUri;

    public String getClientId() {
        return clientId != null ? clientId.trim() : null;
    }

    public String getClientSecret() {
        return clientSecret != null ? clientSecret.trim() : null;
    }

    public String getRedirectUri() {
        return redirectUri != null ? redirectUri.trim() : null;
    }
}
