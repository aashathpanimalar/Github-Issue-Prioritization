package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.DuplicateIssue;
import com.github.issue.prioritization.service.DuplicateIssueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class DuplicateIssueController {

    private final DuplicateIssueService duplicateIssueService;

    public DuplicateIssueController(DuplicateIssueService duplicateIssueService) {
        this.duplicateIssueService = duplicateIssueService;
    }

    @PostMapping("/detect-duplicates/{repoId}")
    public ResponseEntity<String> detectDuplicates(
            @PathVariable Integer repoId) {

        duplicateIssueService.detectDuplicates(repoId);
        return ResponseEntity.ok("Duplicate issue detection completed");
    }

    @GetMapping("/duplicates/{repoId}")
    public ResponseEntity<List<DuplicateIssue>> getDuplicates(@PathVariable Integer repoId) {
        return ResponseEntity.ok(duplicateIssueService.getDuplicates(repoId));
    }
}

