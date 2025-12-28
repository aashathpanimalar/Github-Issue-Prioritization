package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.PublicRepoRequest;
import com.github.issue.prioritization.dto.PublicRepoResponse;
import com.github.issue.prioritization.service.GitHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public-repo")
public class PublicRepoController {

    @Autowired
    private GitHubService gitHubService;

    @PostMapping("/analyze")
    public ResponseEntity<PublicRepoResponse> analyze(
            @RequestBody PublicRepoRequest request) {

        return ResponseEntity.ok(
                gitHubService.analyzePublicRepo(request)
        );
    }
}
