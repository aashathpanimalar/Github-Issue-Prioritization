package com.github.issue.prioritization.service;

import com.github.issue.prioritization.dto.PublicRepoRequest;
import com.github.issue.prioritization.dto.PublicRepoResponse;

public interface PublicRepoService {

    PublicRepoResponse analyzePublicRepo(PublicRepoRequest request);
}
