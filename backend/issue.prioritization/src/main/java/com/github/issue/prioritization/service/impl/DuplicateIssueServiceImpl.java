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

        List<GithubIssue> issues =
                issueRepository.findByRepository(repo);

        for (int i = 0; i < issues.size(); i++) {
            for (int j = i + 1; j < issues.size(); j++) {

                GithubIssue issue1 = issues.get(i);
                GithubIssue issue2 = issues.get(j);

                double similarity =
                        calculateSimilarity(issue1, issue2);

                if (similarity >= 0.7) {

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

    private double calculateSimilarity(
            GithubIssue a, GithubIssue b) {

        String textA = (a.getTitle() + " " + a.getDescription())
                .toLowerCase();

        String textB = (b.getTitle() + " " + b.getDescription())
                .toLowerCase();

        Set<String> wordsA = new HashSet<>(Arrays.asList(textA.split("\\s+")));
        Set<String> wordsB = new HashSet<>(Arrays.asList(textB.split("\\s+")));

        Set<String> intersection = new HashSet<>(wordsA);
        intersection.retainAll(wordsB);

        Set<String> union = new HashSet<>(wordsA);
        union.addAll(wordsB);

        if (union.isEmpty()) return 0.0;

        return (double) intersection.size() / union.size();
    }
}
