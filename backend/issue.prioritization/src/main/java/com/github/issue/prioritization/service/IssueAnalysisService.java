package com.github.issue.prioritization.service;

import com.github.issue.prioritization.dto.IssueAnalysisResponse;
import java.util.List;

public interface IssueAnalysisService {

    List<IssueAnalysisResponse> analyzeIssues(Integer repoId);
}
