package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.DuplicateIssue;
import com.github.issue.prioritization.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface DuplicateIssueRepository
                extends JpaRepository<DuplicateIssue, Integer> {

        @Modifying
        @Transactional
        @Query("DELETE FROM DuplicateIssue di WHERE di.originalIssue.repository = :repo")
        void deleteByRepository(@Param("repo") Repository repo);
}
