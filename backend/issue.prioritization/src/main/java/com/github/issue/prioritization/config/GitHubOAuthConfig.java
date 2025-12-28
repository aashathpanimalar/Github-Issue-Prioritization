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
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getRedirectUri() {
        return redirectUri;
    }
}
