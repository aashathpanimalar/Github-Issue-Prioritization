package com.github.issue.prioritization.ml;

import java.util.*;

public class PriorityTrainingData {

        public static Map<String, List<String>> getTrainingData() {

                Map<String, List<String>> data = new HashMap<>();

                // HIGH PRIORITY - Critical bugs, system failures, security issues, blocking
                // problems
                data.put("HIGH", List.of(
                                // Crashes and Critical Errors
                                "app crashes on startup",
                                "application crashes when clicking button",
                                "login page crashes",
                                "system crashes unexpectedly",
                                "critical error in production",
                                "fatal exception thrown",
                                "null pointer exception breaking app",

                                // System Failures
                                "api returns 500 error",
                                "server is down",
                                "database connection failed",
                                "authentication not working",
                                "users cannot login",
                                "payment system broken",
                                "system failure detected",

                                // Data Loss and Corruption
                                "data loss on save",
                                "database corruption issue",
                                "user data deleted accidentally",
                                "file upload fails and loses data",

                                // Security Vulnerabilities
                                "security vulnerability found",
                                "sql injection possible",
                                "xss attack vector",
                                "authentication bypass discovered",
                                "sensitive data exposed",
                                "unauthorized access detected",

                                // Blocking Issues
                                "cannot deploy to production",
                                "build fails completely",
                                "users locked out of system",
                                "critical feature broken",
                                "application not working at all",
                                "entire module not functioning"));

                // MEDIUM PRIORITY - Performance issues, feature requests, non-critical bugs
                data.put("MEDIUM", List.of(
                                // Performance Issues
                                "dashboard loads slowly",
                                "page takes too long to load",
                                "performance issue on mobile",
                                "slow response time",
                                "memory leak detected",
                                "high cpu usage",
                                "optimize loading speed",
                                "api response is slow",
                                "timeout occurs frequently",

                                // Feature Requests
                                "add dark mode feature",
                                "implement search functionality",
                                "feature request for export",
                                "add user profile page",
                                "improve user experience",
                                "enhance dashboard layout",
                                "add filtering options",

                                // Refactoring and Code Quality
                                "refactor code base",
                                "cleanup old dependencies",
                                "update outdated libraries",
                                "improve code structure",
                                "remove deprecated code",
                                "optimize database queries",

                                // Non-Critical Bugs
                                "button sometimes doesn't respond",
                                "ui glitch on certain screens",
                                "minor calculation error",
                                "edge case not handled",
                                "validation message unclear",
                                "form submission sometimes fails"));

                // LOW PRIORITY - Documentation, cosmetic changes, minor improvements
                data.put("LOW", List.of(
                                // Documentation
                                "typo in documentation",
                                "update readme file",
                                "fix typo in comments",
                                "documentation needs update",
                                "add code comments",
                                "improve api documentation",
                                "update changelog",

                                // Cosmetic and UI Polish
                                "button color is wrong",
                                "text alignment issue",
                                "ui spacing inconsistent",
                                "icon size too small",
                                "font style needs change",
                                "minor ui adjustment needed",
                                "cosmetic fix required",

                                // Minor Improvements
                                "improve error message text",
                                "update label text",
                                "change placeholder text",
                                "adjust tooltip message",
                                "update copyright year",
                                "rename variable for clarity",

                                // Nice-to-Have
                                "add animation to button",
                                "improve loading spinner",
                                "add hover effect",
                                "polish user interface",
                                "quality of life improvement",
                                "suggested enhancement"));

                return data;
        }
}
