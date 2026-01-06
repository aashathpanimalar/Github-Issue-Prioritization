package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RepositoryRepository
                extends JpaRepository<Repository, Integer> {
        Optional<Repository> findByRepoOwnerAndRepoNameAndUser(String owner, String name, User user);

        Optional<Repository> findByRepoOwnerAndRepoNameAndRepoType(String owner, String name, String type);
}
