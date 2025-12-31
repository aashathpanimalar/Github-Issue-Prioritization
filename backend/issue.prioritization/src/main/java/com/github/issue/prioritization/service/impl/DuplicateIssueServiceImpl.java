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

                // 🔽 Lower threshold after normalization
                if (similarity >= 0.4) {

                    DuplicateIssue duplicate = new DuplicateIssue();
                    duplicate.setOriginalIssue(issue1);
                    duplicate.setDuplicateIssue(issue2);
                    duplicate.setSimilarityScore(BigDecimal.valueOf(similarity));
                    duplicate.setDetectedAt(LocalDateTime.now());

                    duplicateRepository.save(duplicate);
                }
            }
        }
    }

    // ================= IMPROVED SIMILARITY =================

    private double calculateImprovedSimilarity(GithubIssue a, GithubIssue b) {

        Set<String> wordsA = preprocessText(a.getTitle() + " " + a.getDescription());
        Set<String> wordsB = preprocessText(b.getTitle() + " " + b.getDescription());

        Set<String> intersection = new HashSet<>(wordsA);
        intersection.retainAll(wordsB);

        Set<String> union = new HashSet<>(wordsA);
        union.addAll(wordsB);

        if (union.isEmpty()) return 0.0;

        return (double) intersection.size() / union.size();
    }

    // ================= TEXT PREPROCESSING =================

    private Set<String> preprocessText(String text) {

        // Common stop words
        Set<String> stopWords = Set.of(
                "a", "the", "is", "to", "when", "on", "in", "very", "and"
        );

        String normalized = text
                .toLowerCase()
                .replaceAll("[^a-z ]", "")   // remove punctuation
                .replaceAll("\\s+", " ");    // normalize spaces

        String[] tokens = normalized.split(" ");

        Set<String> result = new HashSet<>();

        for (String word : tokens) {
            if (word.length() <= 2) continue;
            if (stopWords.contains(word)) continue;

            // simple stemming
            word = word
                    .replaceAll("ing$", "")
                    .replaceAll("ly$", "")
                    .replaceAll("s$", "");

            result.add(word);
        }

        return result;
    }
}
