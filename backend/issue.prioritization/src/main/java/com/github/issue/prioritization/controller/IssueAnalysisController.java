package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.IssueAnalysisResponse;
import com.github.issue.prioritization.service.IssueAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueAnalysisController {

    private final IssueAnalysisService issueAnalysisService;

    public IssueAnalysisController(IssueAnalysisService issueAnalysisService) {
        this.issueAnalysisService = issueAnalysisService;
    }

    @PostMapping("/analyze/{repoId}")
    public ResponseEntity<List<IssueAnalysisResponse>> analyzeIssues(
            @PathVariable Integer repoId) {

        List<IssueAnalysisResponse> response =
                issueAnalysisService.analyzeIssues(repoId);

        return ResponseEntity.ok(response);
    }
}
