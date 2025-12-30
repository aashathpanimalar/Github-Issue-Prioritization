package com.github.issue.prioritization.ml;

import java.util.Map;

public class PriorityClassifier {

    public static String predict(Map<String, Double> vector) {

        double score = 0.0;

        for (String word : vector.keySet()) {

            if (word.contains("error") ||
                    word.contains("bug") ||
                    word.contains("crash") ||
                    word.contains("fail")) {

                score += vector.get(word) * 2;
            }

            if (word.contains("slow") ||
                    word.contains("improve") ||
                    word.contains("optimize")) {

                score += vector.get(word);
            }
        }

        if (score > 0.6) return "HIGH";
        if (score > 0.3) return "MEDIUM";
        return "LOW";
    }
}
