package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.GithubAuth;
import com.github.issue.prioritization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GithubAuthRepository extends JpaRepository<GithubAuth, Integer> {

    Optional<GithubAuth> findByUser(User user);

    Optional<GithubAuth> findByGithubUserId(Long githubUserId);
}
