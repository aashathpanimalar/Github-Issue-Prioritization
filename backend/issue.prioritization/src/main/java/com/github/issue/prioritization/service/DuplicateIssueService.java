package com.github.issue.prioritization.service;

import java.util.List;
import com.github.issue.prioritization.entity.DuplicateIssue;

public interface DuplicateIssueService {
    void detectDuplicates(Integer repoId);
    List<DuplicateIssue> getDuplicates(Integer repoId);
}