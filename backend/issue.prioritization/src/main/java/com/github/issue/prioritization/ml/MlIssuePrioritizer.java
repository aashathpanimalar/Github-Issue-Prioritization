package com.github.issue.prioritization.ml;

public class MlIssuePrioritizer {

    private static final NaiveBayesClassifier classifier = new NaiveBayesClassifier();

    static {
        // 🔴 Train with HIGH priority examples
        classifier.train("critical crash error fail exception system down bug security vulnerability", "HIGH");
        classifier.train("major failure blocking production data loss urgent fix needed", "HIGH");

        // 🟠 Train with MEDIUM priority examples
        classifier.train("slow performance improvement delay optimization feature request", "MEDIUM");
        classifier.train("refactor code base cleanup update dependencies minor enhancement", "MEDIUM");

        // 🟢 Train with LOW priority examples
        classifier.train("typo in documentation ui alignment color change text update", "LOW");
        classifier.train("cosmetic fix label update feedback suggested change", "LOW");
    }

    public static MLPredictionResult analyze(String title, String description) {
        String text = (title + " " + description).toLowerCase();

        PredictionResult result = classifier.predict(text);

        return new MLPredictionResult(result.getPriority(), result.getConfidence());
    }
}
