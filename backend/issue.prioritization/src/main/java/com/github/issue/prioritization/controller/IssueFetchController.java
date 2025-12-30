package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.service.IssueFetchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/issues")
public class IssueFetchController {

    @Autowired
    private IssueFetchService issueFetchService;

    @PostMapping("/fetch/{repoId}")
    public ResponseEntity<?> fetchIssues(@PathVariable Integer repoId) {

        issueFetchService.fetchAndStoreIssues(repoId);

        return ResponseEntity.ok(
                Map.of("message", "Issues fetched and stored successfully")
        );
    }
}
