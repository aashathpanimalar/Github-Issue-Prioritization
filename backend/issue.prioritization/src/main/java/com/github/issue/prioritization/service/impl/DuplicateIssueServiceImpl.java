package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.entity.*;
import com.github.issue.prioritization.ml.CosineSimilarity;
import com.github.issue.prioritization.ml.DuplicateIssueDetector;
import com.github.issue.prioritization.ml.TfIdfVectorizer;
import com.github.issue.prioritization.repository.*;
import com.github.issue.prioritization.service.DuplicateIssueService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DuplicateIssueServiceImpl implements DuplicateIssueService {

    private final GithubIssueRepository issueRepository;
    private final DuplicateIssueRepository duplicateIssueRepository;
    private final RepositoryRepository repositoryRepository;

    public DuplicateIssueServiceImpl(
            GithubIssueRepository issueRepository,
            DuplicateIssueRepository duplicateIssueRepository,
            RepositoryRepository repositoryRepository) {

        this.issueRepository = issueRepository;
        this.duplicateIssueRepository = duplicateIssueRepository;
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

                String text1 = (issue1.getTitle() + " " +
                        issue1.getDescription()).toLowerCase();

                String text2 = (issue2.getTitle() + " " +
                        issue2.getDescription()).toLowerCase();

                var tf1 = TfIdfVectorizer.tf(text1);
                var tf2 = TfIdfVectorizer.tf(text2);

                double similarity =
                        CosineSimilarity.calculate(tf1, tf2);

                if (similarity >= 0.75) {

                    DuplicateIssue duplicate = new DuplicateIssue();
                    duplicate.setIssue(issue1);
                    duplicate.setDuplicateIssue(issue2);
                    duplicate.setSimilarityScore(
                            BigDecimal.valueOf(similarity)
                    );
                    duplicate.setDetectedAt(LocalDateTime.now());

                    duplicateIssueRepository.save(duplicate);
                }
            }
        }
    }
}
