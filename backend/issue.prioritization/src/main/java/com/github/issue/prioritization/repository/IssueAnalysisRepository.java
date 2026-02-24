package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.IssueAnalysis;
import com.github.issue.prioritization.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface IssueAnalysisRepository
                extends JpaRepository<IssueAnalysis, Integer> {

        @Modifying
        @Transactional
        @Query("DELETE FROM IssueAnalysis ia WHERE ia.githubIssue.repository = :repo")
        void deleteByRepository(@Param("repo") Repository repo);
}