package com.github.issue.prioritization.ml;

import java.util.*;

public class TfIdfVectorizer {

    public static Map<String, Double> vectorize(String text) {

        Map<String, Double> tf = new HashMap<>();
        String[] words = text.split(" ");

        for (String word : words) {
            tf.put(word, tf.getOrDefault(word, 0.0) + 1.0);
        }

        // Normalize
        for (String word : tf.keySet()) {
            tf.put(word, tf.get(word) / words.length);
        }

        return tf;
    }
}
