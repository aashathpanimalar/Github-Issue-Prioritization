package com.github.issue.prioritization.ml;

import java.util.*;

public class PriorityTrainingData {

    public static Map<String, List<String>> getTrainingData() {

        Map<String, List<String>> data = new HashMap<>();

        data.put("HIGH", List.of(
                "app crashes",
                "login page crashes",
                "error occurs",
                "api returns 500",
                "system failure",
                "critical bug",
                "application not working"
        ));

        data.put("MEDIUM", List.of(
                "dashboard loads slowly",
                "performance issue",
                "slow response",
                "optimize loading",
                "improve performance"
        ));

        data.put("LOW", List.of(
                "typo in text",
                "update readme",
                "documentation change",
                "ui text issue",
                "minor ui change"
        ));

        return data;
    }
}
