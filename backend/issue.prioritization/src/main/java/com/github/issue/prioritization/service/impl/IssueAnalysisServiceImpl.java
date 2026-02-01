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
                        // 🚀 REFINED PRODUCTION-LEVEL SCORING
                        // ============================

                        MLPredictionResult result = MlIssuePrioritizer.analyze(issue.getTitle(),
                                        issue.getDescription());

                        // 1. BASE ML SCORE
                        double mlPriorityScore = "HIGH".equals(result.getPriority()) ? 5.0
                                        : "MEDIUM".equals(result.getPriority()) ? 3.0 : 1.0;

                        // 2. KEYWORD-BASED IMPACT ANALYSIS
                        String text = (issue.getTitle() + " "
                                        + (issue.getDescription() != null ? issue.getDescription() : "")).toLowerCase();
                        double impactModifier = 0.0;

                        if (text.contains("crash") || text.contains("fatal") || text.contains("security")
                                        || text.contains("vulnerability")) {
                                impactModifier += 3.5;
                        } else if (text.contains("broken") || text.contains("cannot") || text.contains("fail")) {
                                impactModifier += 2.0;
                        } else if (text.contains("slow") || text.contains("load") || text.contains("performance")
                                        || text.contains("optimization")) {
                                impactModifier += 1.0;
                        }

                        // 3. URGENCY / AGE COMPONENT
                        long daysOld = 0;
                        if (issue.getCreatedDate() != null) {
                                daysOld = java.time.temporal.ChronoUnit.DAYS.between(issue.getCreatedDate(),
                                                LocalDateTime.now());
                        }
                        double ageWeight = Math.min(2.0, (daysOld / 30.0) * 0.4); // Max 2 points after 5 months

                        // 4. CONFIDENCE STRENGTH
                        double confidenceFactor = Math.max(0.05, result.getConfidence());

                        // 5. FINAL SCORE CALCULATION (0-10)
                        // Balanced formula: ML Priority(50%) + Impact Keywords(35%) + Age/Urgency(15%)
                        double rawScore = (mlPriorityScore * 1.0) + impactModifier + ageWeight;
                        double finalScore = Math.min(10.0, rawScore * (0.8 + (confidenceFactor * 0.4)));

                        // Determine Risk Level
                        String riskLevel;
                        if (finalScore >= 8.5)
                                riskLevel = "CRITICAL";
                        else if (finalScore >= 6.5)
                                riskLevel = "HIGH";
                        else if (finalScore >= 4.0)
                                riskLevel = "MODERATE";
                        else
                                riskLevel = "LOW";

                        // Create Analysis Record
                        IssueAnalysis analysis = new IssueAnalysis();
                        analysis.setGithubIssue(issue);
                        analysis.setPredictedPriority(result.getPriority());
                        analysis.setConfidenceScore(
                                        BigDecimal.valueOf(confidenceFactor).setScale(2, RoundingMode.HALF_UP));
                        analysis.setAnalyzedAt(LocalDateTime.now());
                        analysisRepository.save(analysis);

                        // Professional Summary Generation
                        String intelligentSummary = String.format(
                                        "AI deep-scan identified this as a %s priority issue. Analysis detected %s patterns with %.0f%% pattern-match confidence. "
                                                        +
                                                        "Risk factors include %s and issue latency of %d days.",
                                        result.getPriority().toLowerCase(),
                                        impactModifier >= 3.0 ? "CRITICAL IMPACT"
                                                        : impactModifier >= 1.0 ? "OPERATIONAL IMPACT" : "LOW IMPACT",
                                        confidenceFactor * 100,
                                        riskLevel.toLowerCase() + " priority profiling",
                                        daysOld);

                        responses.add(
                                        new IssueAnalysisResponse(
                                                        issue.getIssueId(),
                                                        issue.getTitle(),
                                                        result.getPriority(),
                                                        BigDecimal.valueOf(finalScore).setScale(1, RoundingMode.HALF_UP)
                                                                        .doubleValue(),
                                                        intelligentSummary,
                                                        BigDecimal.valueOf(finalScore).setScale(1, RoundingMode.HALF_UP)
                                                                        .doubleValue(), // Sync riskScore with
                                                                                        // finalScore for UI
                                                        riskLevel));
                }

                return responses;
        }
}
