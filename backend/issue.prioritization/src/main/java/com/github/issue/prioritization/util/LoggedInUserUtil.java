package com.github.issue.prioritization.util;

import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class LoggedInUserUtil {

    private final UserRepository userRepository;

    public LoggedInUserUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getLoggedInUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new RuntimeException("No authentication found in security context");
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof String) {
            String email = (String) principal;
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        }

        throw new RuntimeException(
                "Invalid principal type: " + (principal != null ? principal.getClass().getName() : "null"));
    }
}
