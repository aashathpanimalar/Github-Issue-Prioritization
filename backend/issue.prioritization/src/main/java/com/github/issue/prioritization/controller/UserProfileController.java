package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.UserRepository;
import com.github.issue.prioritization.util.LoggedInUserUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserRepository userRepository;
    private final LoggedInUserUtil loggedInUserUtil;

    public UserProfileController(UserRepository userRepository, LoggedInUserUtil loggedInUserUtil) {
        this.userRepository = userRepository;
        this.loggedInUserUtil = loggedInUserUtil;
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        User user = loggedInUserUtil.getLoggedInUser();

        if (request.containsKey("name")) {
            user.setName(request.get("name"));
        }
        if (request.containsKey("role")) {
            user.setRole(request.get("role"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "name", user.getName(), "role",
                user.getRole() != null ? user.getRole() : ""));
    }
}
