package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.IssueAnalysisRequest;
import com.github.issue.prioritization.dto.IssueAnalysisResponse;
import com.github.issue.prioritization.service.IssueAnalysisService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issue-analysis")
public class IssueAnalysisController {

    private final IssueAnalysisService issueAnalysisService;

    public IssueAnalysisController(IssueAnalysisService issueAnalysisService) {
        this.issueAnalysisService = issueAnalysisService;
    }

    @PostMapping("/analyze")
    public List<IssueAnalysisResponse> analyzeIssues(
            @RequestBody IssueAnalysisRequest request) {

        return issueAnalysisService.analyzeIssues(request);
    }
}
