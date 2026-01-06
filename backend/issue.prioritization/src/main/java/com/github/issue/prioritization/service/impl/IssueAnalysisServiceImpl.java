package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.dto.IssueAnalysisResponse;
import com.github.issue.prioritization.entity.GithubIssue;
import com.github.issue.prioritization.entity.IssueAnalysis;
import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.ml.MLPredictionResult;
import com.github.issue.prioritization.ml.MlIssuePrioritizer;
import com.github.issue.prioritization.repository.GithubIssueRepository;
import com.github.issue.prioritization.repository.IssueAnalysisRepository;
import com.github.issue.prioritization.repository.RepositoryRepository;
import com.github.issue.prioritization.service.IssueAnalysisService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class IssueAnalysisServiceImpl implements IssueAnalysisService {

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
        public List<IssueAnalysisResponse> analyzeIssues(Integer repoId) {

                Repository repo = repositoryRepository.findById(repoId)
                                .orElseThrow(() -> new RuntimeException("Repository not found"));

                List<GithubIssue> issues = issueRepository.findByRepository(repo);

                List<IssueAnalysisResponse> responses = new ArrayList<>();

                for (GithubIssue issue : issues) {

                        // ============================
                        // ✅ NAIVE BAYES ML PREDICTION
                        // ============================
                        MLPredictionResult result = MlIssuePrioritizer.analyze(
                                        issue.getTitle(),
                                        issue.getDescription());

                        // 🛡 Safety: confidence should never be 0 or null
                        double rawConfidence = result.getConfidence();
                        if (rawConfidence <= 0.0) {
                                rawConfidence = 0.05; // minimal confidence instead of 0.00
                        }

                        BigDecimal confidence = BigDecimal.valueOf(rawConfidence)
                                        .setScale(2, RoundingMode.HALF_UP);

                        IssueAnalysis analysis = new IssueAnalysis();
                        analysis.setGithubIssue(issue);
                        analysis.setPredictedPriority(result.getPriority());
                        analysis.setConfidenceScore(confidence);
                        analysis.setAnalyzedAt(LocalDateTime.now());

                        analysisRepository.save(analysis);

                        // ============================
                        // 🚀 RISK SCORE CALCULATION
                        // ============================
                        double priorityWeight = "HIGH".equals(result.getPriority()) ? 7.0
                                        : "MEDIUM".equals(result.getPriority()) ? 4.0 : 1.0;

                        long daysOld = java.time.temporal.ChronoUnit.DAYS.between(issue.getCreatedDate(),
                                        LocalDateTime.now());
                        double ageWeight = Math.min(3.0, (daysOld / 30.0) * 0.5); // Max 3 points for age (6 months+)

                        double riskScore = Math.min(10.0, priorityWeight + ageWeight + (rawConfidence * 2));
                        String riskLevel = riskScore >= 7.5 ? "CRITICAL"
                                        : riskScore >= 5.0 ? "HIGH" : riskScore >= 2.5 ? "MODERATE" : "LOW";

                        responses.add(
                                        new IssueAnalysisResponse(
                                                        issue.getIssueId(),
                                                        issue.getTitle(),
                                                        result.getPriority(),
                                                        rawConfidence * 10, // Scale to 0-10 for the UI
                                                        "ML Analysis: This " + result.getPriority().toLowerCase() +
                                                                        " priority issue was detected with "
                                                                        + (int) (rawConfidence * 100) +
                                                                        "% confidence based on its description and patterns.",
                                                        BigDecimal.valueOf(riskScore).setScale(1, RoundingMode.HALF_UP)
                                                                        .doubleValue(),
                                                        riskLevel));
                }

                return responses;
        }
}
