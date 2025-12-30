package com.github.issue.prioritization.ml;

public class MlIssuePrioritizer {

    public static MLPredictionResult analyze(String title, String description) {

        String text = (title + " " + description).toLowerCase();

        double score = 0.0;

        // 🔴 High severity words
        if (text.contains("crash") || text.contains("error")
                || text.contains("fail") || text.contains("exception")
                || text.contains("500")) {
            score += 0.7;
        }

        // 🟠 Medium severity words
        if (text.contains("slow") || text.contains("delay")
                || text.contains("improve") || text.contains("performance")) {
            score += 0.4;
        }

        // 🟢 Low severity words
        if (text.contains("typo") || text.contains("ui")
                || text.contains("text") || text.contains("alignment")) {
            score += 0.2;
        }

        // ✅ Decide priority
        String priority;
        if (score >= 0.7) {
            priority = "HIGH";
        } else if (score >= 0.4) {
            priority = "MEDIUM";
        } else {
            priority = "LOW";
        }

        // ✅ Confidence score (0.0 – 1.0)
        double confidence = Math.min(score, 1.0);

        return new MLPredictionResult(priority, confidence);
    }
}
