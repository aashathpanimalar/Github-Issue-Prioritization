package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.GithubIssue;
import com.github.issue.prioritization.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface GithubIssueRepository extends JpaRepository<GithubIssue, Integer> {

    // ✅ Correct method based on entity
    List<GithubIssue> findByRepository(Repository repository);

    // ✅ Deletes old issues before new scan
    @Modifying
    @Transactional
    @Query("DELETE FROM GithubIssue gi WHERE gi.repository = :repository")
    void deleteByRepository(@Param("repository") Repository repository);
}
