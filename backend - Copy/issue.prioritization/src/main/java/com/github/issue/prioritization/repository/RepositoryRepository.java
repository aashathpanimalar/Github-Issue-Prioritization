package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.Repository;
import com.github.issue.prioritization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepositoryRepository extends JpaRepository<Repository, Integer> {

    List<Repository> findByUser(User user);
}
