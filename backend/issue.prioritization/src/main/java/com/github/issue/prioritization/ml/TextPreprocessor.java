package com.github.issue.prioritization.ml;

public class TextPreprocessor {

    public static String preprocess(String text) {

        if (text == null) return "";

        // Lowercase
        text = text.toLowerCase();

        // Remove special characters
        text = text.replaceAll("[^a-zA-Z ]", " ");

        // Remove extra spaces
        text = text.replaceAll("\\s+", " ").trim();

        return text;
    }
}
