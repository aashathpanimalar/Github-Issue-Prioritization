package com.github.issue.prioritization.ml;

import java.util.*;

public class NaiveBayesPriorityClassifier {

    private final Map<String, Map<String, Integer>> wordCount = new HashMap<>();
    private final Map<String, Integer> classCount = new HashMap<>();
    private final Set<String> vocabulary = new HashSet<>();

    public NaiveBayesPriorityClassifier() {
        train();
    }

    private void train() {

        Map<String, List<String>> trainingData =
                PriorityTrainingData.getTrainingData();

        for (String label : trainingData.keySet()) {

            classCount.put(label, trainingData.get(label).size());
            wordCount.put(label, new HashMap<>());

            for (String sentence : trainingData.get(label)) {

                for (String word : tokenize(sentence)) {

                    vocabulary.add(word);
                    wordCount.get(label)
                            .put(word,
                                    wordCount.get(label).getOrDefault(word, 0) + 1);
                }
            }
        }
    }

    public PredictionResult predict(String text) {

        Map<String, Double> probabilities = new HashMap<>();
        int vocabSize = vocabulary.size();

        for (String label : classCount.keySet()) {

            double logProb = Math.log(classCount.get(label));

            for (String word : tokenize(text)) {

                int count =
                        wordCount.get(label).getOrDefault(word, 0);

                logProb += Math.log(
                        (count + 1.0) /
                                (classCount.get(label) + vocabSize)
                );
            }

            probabilities.put(label, logProb);
        }

        // Normalize probabilities
        double max = Collections.max(probabilities.values());
        double sum = 0;

        for (String key : probabilities.keySet()) {
            probabilities.put(key, Math.exp(probabilities.get(key) - max));
            sum += probabilities.get(key);
        }

        for (String key : probabilities.keySet()) {
            probabilities.put(key, probabilities.get(key) / sum);
        }

        // Pick highest
        String predicted =
                probabilities.entrySet()
                        .stream()
                        .max(Map.Entry.comparingByValue())
                        .get()
                        .getKey();

        double confidence = probabilities.get(predicted);

        return new PredictionResult(predicted, confidence);
    }

    private List<String> tokenize(String text) {
        return Arrays.asList(
                text.toLowerCase()
                        .replaceAll("[^a-z ]", "")
                        .split("\\s+")
        );
    }
}
