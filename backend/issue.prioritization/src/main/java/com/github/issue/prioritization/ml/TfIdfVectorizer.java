//package com.github.issue.prioritization.ml;
//
//import java.util.*;
//
//public class TfIdfVectorizer {
//
//    public static Map<String, Double> tf(String text) {
//        Map<String, Double> tfMap = new HashMap<>();
//        String[] words = text.split("\\s+");
//
//        for (String word : words) {
//            tfMap.put(word, tfMap.getOrDefault(word, 0.0) + 1);
//        }
//
//        int totalWords = words.length;
//        tfMap.replaceAll((k, v) -> v / totalWords);
//        return tfMap;
//    }
//}
package com.github.issue.prioritization.ml;

import java.util.*;

public class TfIdfVectorizer {

    public static Map<String, Double> tfIdf(
            String document,
            List<String> allDocuments) {

        Map<String, Double> tfIdfMap = new HashMap<>();

        String[] words = document.toLowerCase().split("\\s+");
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(words));

        for (String word : uniqueWords) {

            double tf = termFrequency(word, words);
            double idf = inverseDocumentFrequency(word, allDocuments);

            tfIdfMap.put(word, tf * idf);
        }

        return tfIdfMap;
    }

    private static double termFrequency(String word, String[] words) {
        long count = Arrays.stream(words)
                .filter(w -> w.equals(word))
                .count();
        return (double) count / words.length;
    }

    private static double inverseDocumentFrequency(
            String word,
            List<String> documents) {

        long docCount = documents.stream()
                .filter(doc -> doc.contains(word))
                .count();

        return Math.log((double) documents.size() / (1 + docCount));
    }
}
