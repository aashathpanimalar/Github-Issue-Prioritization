package com.github.issue.prioritization.ml;

import java.util.*;

public class NaiveBayesClassifier {

    private final Map<String, Map<String, Integer>> wordCounts = new HashMap<>();
    private final Map<String, Integer> classCounts = new HashMap<>();
    private int totalSamples = 0;

    public NaiveBayesClassifier() {
        wordCounts.put("HIGH", new HashMap<>());
        wordCounts.put("MEDIUM", new HashMap<>());
        wordCounts.put("LOW", new HashMap<>());

        classCounts.put("HIGH", 0);
        classCounts.put("MEDIUM", 0);
        classCounts.put("LOW", 0);
    }

    // 🔹 Train model
    public void train(String text, String label) {
        totalSamples++;
        classCounts.put(label, classCounts.get(label) + 1);

        for (String word : text.split("\\s+")) {
            wordCounts.get(label)
                    .put(word, wordCounts.get(label).getOrDefault(word, 0) + 1);
        }
    }

    // 🔹 Predict
    public PredictionResult predict(String text) {

        Map<String, Double> scores = new HashMap<>();

        for (String label : classCounts.keySet()) {
            double score = Math.log(classCounts.get(label) / (double) totalSamples);

            for (String word : text.split("\\s+")) {
                int count = wordCounts.get(label).getOrDefault(word, 1);
                score += Math.log(count);
            }

            scores.put(label, score);
        }

        String bestLabel = Collections.max(scores.entrySet(),
                Map.Entry.comparingByValue()).getKey();

        double confidence = normalize(scores, bestLabel);

        return new PredictionResult(bestLabel, confidence);
    }

    private double normalize(Map<String, Double> scores, String label) {
        double sum = scores.values().stream().mapToDouble(Math::exp).sum();
        return Math.exp(scores.get(label)) / sum;
    }
}
