package com.github.issue.prioritization.ml;

import java.util.*;

public class DuplicateIssueDetector {

    public static double similarity(String text1, String text2) {

        Set<String> words1 = new HashSet<>(Arrays.asList(text1.split("\\s+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(text2.split("\\s+")));

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        if (union.isEmpty()) return 0.0;

        return (double) intersection.size() / union.size();
    }
}
