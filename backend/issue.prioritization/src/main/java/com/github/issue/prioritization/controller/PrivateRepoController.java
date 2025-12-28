package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.PrivateRepoRequest;
import com.github.issue.prioritization.dto.PrivateRepoResponse;
import com.github.issue.prioritization.service.PrivateRepoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/private-repo")
public class PrivateRepoController {

    private final PrivateRepoService privateRepoService;

    public PrivateRepoController(PrivateRepoService privateRepoService) {
        this.privateRepoService = privateRepoService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<PrivateRepoResponse> analyze(
            @RequestBody PrivateRepoRequest request) {

        return ResponseEntity.ok(
                privateRepoService.analyzePrivateRepo(request)
        );
    }
}
