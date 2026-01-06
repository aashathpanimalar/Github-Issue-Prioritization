package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.IssueAnalysisResponse;
import com.github.issue.prioritization.service.IssueAnalysisService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/export")
public class CSVExportController {

    private final IssueAnalysisService issueAnalysisService;

    public CSVExportController(IssueAnalysisService issueAnalysisService) {
        this.issueAnalysisService = issueAnalysisService;
    }

    @GetMapping("/csv/{repoId}")
    public void exportToCSV(@PathVariable Integer repoId, HttpServletResponse response) throws IOException {
        List<IssueAnalysisResponse> issues = issueAnalysisService.analyzeIssues(repoId);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; file=prioritized_issues_" + repoId + ".csv");

        PrintWriter writer = response.getWriter();
        writer.println("Issue ID,Title,Priority,Confidence Score,Risk Score,Risk Level,Summary");

        for (IssueAnalysisResponse issue : issues) {
            writer.println(String.format("%d,\"%s\",\"%s\",%.2f,%.2f,\"%s\",\"%s\"",
                    issue.getIssueId(),
                    issue.getTitle().replace("\"", "\"\""),
                    issue.getPriority(),
                    issue.getScore(),
                    issue.getRiskScore(),
                    issue.getRiskLevel(),
                    issue.getSummary().replace("\"", "\"\"").replace("\n", " ")));
        }
        writer.close();
    }
}
