package com.github.issue.prioritization.ml;

public class PredictionResult {

    private final String priority;
    private final double confidence;

    public PredictionResult(String priority, double confidence) {
        this.priority = priority;
        this.confidence = confidence;
    }

    public String getPriority() {
        return priority;
    }

    public double getConfidence() {
        return confidence;
    }
}
