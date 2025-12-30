package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.*;
import com.github.issue.prioritization.entity.GithubIssue;
import com.github.issue.prioritization.entity.IssueAnalysis;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.repository.GithubIssueRepository;
import com.github.issue.prioritization.repository.IssueAnalysisRepository;
import com.github.issue.prioritization.repository.RepositoryRepository;
import com.github.issue.prioritization.service.IssueAnalysisService;
import com.github.issue.prioritization.ml.*;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class IssueAnalysisServiceImpl
        implements IssueAnalysisService {

    private final GithubIssueRepository issueRepository;
    private final RepositoryRepository repositoryRepository;
    private final IssueAnalysisRepository analysisRepository;

    public IssueAnalysisServiceImpl(
            GithubIssueRepository issueRepository,
            RepositoryRepository repositoryRepository,
            IssueAnalysisRepository analysisRepository) {

        this.issueRepository = issueRepository;
        this.repositoryRepository = repositoryRepository;
        this.analysisRepository = analysisRepository;
    }

    @Override
    public List<IssueAnalysisResponse> analyzeIssues(
            IssueAnalysisRequest request) {

        Repository repository = repositoryRepository.findById(
                request.getRepositoryId()
        ).orElseThrow(() ->
                new RuntimeException("Repository not found"));

        List<GithubIssue> issues =
                issueRepository.findByRepository(repository);

        List<IssueAnalysisResponse> responses = new ArrayList<>();

        for (GithubIssue issue : issues) {

            // 🔹 Combine issue text
            String text =
                    issue.getTitle() + " " +
                            issue.getDescription();

            // 🔹 ML logic (placeholder)
            double score = Math.random();
            String priority =
                    score > 0.7 ? "HIGH" :
                            score > 0.4 ? "MEDIUM" : "LOW";

            // 🔹 Save analysis result
            IssueAnalysis analysis = new IssueAnalysis();
            analysis.setGithubIssue(issue);
            analysis.setPredictedPriority(priority);
            analysis.setConfidenceScore(BigDecimal.valueOf(score));
            analysis.setAnalyzedAt(LocalDateTime.now());

            analysisRepository.save(analysis);

            // 🔹 API response
            responses.add(
                    new IssueAnalysisResponse(
                            issue.getIssueId(),
                            issue.getTitle(),
                            priority
                    )
            );
        }

        return responses;
    }
}
