package com.github.issue.prioritization.ml;

public class TextPreprocessor {

    public static String clean(String text) {

        if (text == null) return "";

        return text
                .toLowerCase()
                .replaceAll("[^a-z ]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
