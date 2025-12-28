package com.github.issue.prioritization.repository;

import com.github.issue.prioritization.entity.AnalysisHistory;
import com.github.issue.prioritization.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, Integer> {

    List<AnalysisHistory> findByUser(User user);
}
