package com.github.issue.prioritization.ml;

import java.util.*;

public class TfIdfVectorizer {

    public static Map<String, Double> tf(String text) {
        Map<String, Double> tfMap = new HashMap<>();
        String[] words = text.split("\\s+");

        for (String word : words) {
            tfMap.put(word, tfMap.getOrDefault(word, 0.0) + 1);
        }

        int totalWords = words.length;
        tfMap.replaceAll((k, v) -> v / totalWords);
        return tfMap;
    }
}
