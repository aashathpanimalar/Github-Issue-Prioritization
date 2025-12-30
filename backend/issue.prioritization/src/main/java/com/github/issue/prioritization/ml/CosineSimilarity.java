package com.github.issue.prioritization.ml;

import java.util.Map;

public class CosineSimilarity {

    public static double calculate(
            Map<String, Double> v1,
            Map<String, Double> v2) {

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (String key : v1.keySet()) {
            dotProduct += v1.get(key) * v2.getOrDefault(key, 0.0);
            norm1 += Math.pow(v1.get(key), 2);
        }

        for (double value : v2.values()) {
            norm2 += Math.pow(value, 2);
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
