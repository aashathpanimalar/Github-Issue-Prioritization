package com.github.issue.prioritization.ml;

import java.util.*;

public class TfIdfVectorizer {

    public static double score(String text) {

        String[] words = text.split(" ");
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(words));

        return uniqueWords.size(); // simplified TF-IDF weight
    }
}
