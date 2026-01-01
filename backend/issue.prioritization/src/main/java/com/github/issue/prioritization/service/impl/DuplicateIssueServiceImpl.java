package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.entity.*;
import com.github.issue.prioritization.repository.*;
import com.github.issue.prioritization.service.DuplicateIssueService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DuplicateIssueServiceImpl implements DuplicateIssueService {

    private final GithubIssueRepository issueRepository;
    private final DuplicateIssueRepository duplicateRepository;
    private final RepositoryRepository repositoryRepository;

    public DuplicateIssueServiceImpl(
            GithubIssueRepository issueRepository,
            DuplicateIssueRepository duplicateRepository,
            RepositoryRepository repositoryRepository) {

        this.issueRepository = issueRepository;
        this.duplicateRepository = duplicateRepository;
        this.repositoryRepository = repositoryRepository;
    }

    @Override
    public void detectDuplicates(Integer repoId) {

        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        List<GithubIssue> issues = issueRepository.findByRepository(repo);

        for (int i = 0; i < issues.size(); i++) {
            for (int j = i + 1; j < issues.size(); j++) {

                GithubIssue issue1 = issues.get(i);
                GithubIssue issue2 = issues.get(j);

                double similarity = calculateImprovedSimilarity(issue1, issue2);

                // ✅ Practical threshold for semantic similarity
                if (similarity >= 0.40) {

                    DuplicateIssue duplicate = new DuplicateIssue();
                    duplicate.setOriginalIssue(issue1);
                    duplicate.setDuplicateIssue(issue2);
                    duplicate.setSimilarityScore(
                            BigDecimal.valueOf(similarity).setScale(2, BigDecimal.ROUND_HALF_UP)
                    );
                    duplicate.setDetectedAt(LocalDateTime.now());

                    duplicateRepository.save(duplicate);
                }
            }
        }
    }

    // ================= IMPROVED SIMILARITY =================

    private double calculateImprovedSimilarity(GithubIssue a, GithubIssue b) {

        Map<String, Integer> vectorA = buildWeightedVector(
                a.getTitle() + " " + a.getDescription()
        );
        Map<String, Integer> vectorB = buildWeightedVector(
                b.getTitle() + " " + b.getDescription()
        );

        return cosineSimilarity(vectorA, vectorB);
    }

    // ================= TF-IDF STYLE VECTOR =================

    private Map<String, Integer> buildWeightedVector(String text) {

        Set<String> stopWords = Set.of(
                "a", "the", "is", "to", "when", "on", "in", "very",
                "and", "of", "for", "with", "this", "that"
        );

        String normalized = text
                .toLowerCase()
                .replaceAll("[^a-z ]", " ")
                .replaceAll("\\s+", " ");

        String[] tokens = normalized.split(" ");

        Map<String, Integer> vector = new HashMap<>();

        for (String word : tokens) {

            if (word.length() <= 2) continue;
            if (stopWords.contains(word)) continue;

            // 🔹 Simple stemming
            word = word
                    .replaceAll("ing$", "")
                    .replaceAll("ed$", "")
                    .replaceAll("ly$", "")
                    .replaceAll("s$", "");

            vector.put(word, vector.getOrDefault(word, 0) + 1);
        }

        return vector;
    }

    // ================= COSINE SIMILARITY =================

    private double cosineSimilarity(
            Map<String, Integer> vecA,
            Map<String, Integer> vecB) {

        Set<String> allWords = new HashSet<>();
        allWords.addAll(vecA.keySet());
        allWords.addAll(vecB.keySet());

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (String word : allWords) {
            int a = vecA.getOrDefault(word, 0);
            int b = vecB.getOrDefault(word, 0);

            dotProduct += a * b;
            magnitudeA += a * a;
            magnitudeB += b * b;
        }

        if (magnitudeA == 0 || magnitudeB == 0) return 0.0;

        return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    }
}
