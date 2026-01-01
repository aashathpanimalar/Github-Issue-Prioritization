//package com.github.issue.prioritization.ml;
//
//import java.util.Map;
//
//public class CosineSimilarity {
//
//    public static double calculate(
//            Map<String, Double> v1,
//            Map<String, Double> v2) {
//
//        double dotProduct = 0.0;
//        double norm1 = 0.0;
//        double norm2 = 0.0;
//
//        for (String key : v1.keySet()) {
//            dotProduct += v1.get(key) * v2.getOrDefault(key, 0.0);
//            norm1 += Math.pow(v1.get(key), 2);
//        }
//
//        for (double value : v2.values()) {
//            norm2 += Math.pow(value, 2);
//        }
//
//        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
//    }
//}
package com.github.issue.prioritization.ml;

import java.util.Map;
import java.util.Set;
import java.util.HashSet;

public class CosineSimilarityUtil {

    public static double cosineSimilarity(
            Map<String, Double> vec1,
            Map<String, Double> vec2) {

        Set<String> allWords = new HashSet<>();
        allWords.addAll(vec1.keySet());
        allWords.addAll(vec2.keySet());

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (String word : allWords) {
            double v1 = vec1.getOrDefault(word, 0.0);
            double v2 = vec2.getOrDefault(word, 0.0);

            dotProduct += v1 * v2;
            norm1 += v1 * v1;
            norm2 += v2 * v2;
        }

        if (norm1 == 0 || norm2 == 0) return 0.0;

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
