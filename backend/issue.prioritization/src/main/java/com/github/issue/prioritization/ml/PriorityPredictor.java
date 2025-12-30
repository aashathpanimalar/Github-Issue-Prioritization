package com.github.issue.prioritization.ml;

public class PriorityPredictor {

    public static String predict(double score) {

        if (score > 15) return "HIGH";
        if (score > 7) return "MEDIUM";
        return "LOW";
    }
}
