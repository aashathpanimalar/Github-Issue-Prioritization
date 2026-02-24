package com.github.issue.prioritization.ml;

public class MlIssuePrioritizer {

    private static final NaiveBayesClassifier classifier = new NaiveBayesClassifier();

    static {
        // 🔴 HIGH PRIORITY - Critical, Blocking, Security, Data Loss
        classifier.train("critical crash error fail exception system down bug security vulnerability", "HIGH");
        classifier.train("major failure blocking production data loss urgent fix needed", "HIGH");
        classifier.train("cannot login authentication broken users locked out payment failed", "HIGH");
        classifier.train("database connection error api returns 500 server down fatal exception", "HIGH");
        classifier.train("sql injection xss attack security breach unauthorized access exposed", "HIGH");
        classifier.train("application not working broken feature build fails deployment blocked", "HIGH");
        classifier.train("data corruption file loss null pointer critical bug severe issue incident", "HIGH");

        // 🟠 MEDIUM PRIORITY - Performance, Features, non-critical bugs, enhancements
        classifier.train("slow performance improvement delay optimization feature request", "MEDIUM");
        classifier.train("refactor code base cleanup update dependencies minor enhancement", "MEDIUM");
        classifier.train("memory leak high cpu timeout loading speed api response time lag", "MEDIUM");
        classifier.train("add feature implement functionality enhance user experience improve", "MEDIUM");
        classifier.train("ui glitch edge case validation error form submission sometimes", "MEDIUM");
        classifier.train("dark mode search filter export profile dashboard layout options", "MEDIUM");
        classifier.train("responsive design mobile view accessibility contrast navigation", "MEDIUM");
        classifier.train("integration third party api webhook notification sync", "MEDIUM");

        // 🟢 LOW PRIORITY - Documentation, Cosmetic, Polish, non-functional
        classifier.train("typo in documentation ui alignment color change text update", "LOW");
        classifier.train("cosmetic fix label update feedback suggested change", "LOW");
        classifier.train("readme comment changelog documentation api docs code comments", "LOW");
        classifier.train("button color icon size font style spacing tooltip placeholder", "LOW");
        classifier.train("animation hover effect polish quality of life nice to have", "LOW");
        classifier.train("copyright year variable rename minor adjustment suggested improvement", "LOW");
        classifier.train("cleanup unused imports format code linting style", "LOW");
    }

    public static MLPredictionResult analyze(String title, String description) {
        String text = (title + " " + description).toLowerCase();

        PredictionResult result = classifier.predict(text);

        return new MLPredictionResult(result.getPriority(), result.getConfidence());
    }
}
