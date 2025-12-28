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

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
