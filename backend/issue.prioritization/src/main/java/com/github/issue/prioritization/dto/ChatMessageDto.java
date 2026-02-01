package com.github.issue.prioritization.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String message;

    @JsonProperty("user_token")
    private String userToken;

    private String repo;

    @JsonProperty("issue_context")
    private Map<String, Object> issueContext;
}
