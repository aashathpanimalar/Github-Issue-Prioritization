package com.github.issue.prioritization.service;

import com.github.issue.prioritization.dto.PrivateRepoRequest;
import com.github.issue.prioritization.dto.PrivateRepoResponse;

public interface PrivateRepoService {

    PrivateRepoResponse analyzePrivateRepo(PrivateRepoRequest request);
}
