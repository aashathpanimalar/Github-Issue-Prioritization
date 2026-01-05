package com.github.issue.prioritization.controller;

import com.github.issue.prioritization.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.github.issue.prioritization.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
        System.out.println("DEBUG: Received signup request for email: " + request.getEmail());
        try {
            authService.signup(request);
            System.out.println("DEBUG: Signup successful for: " + request.getEmail());
            return ResponseEntity.ok("Signup successful. OTP sent to email.");
        } catch (Exception e) {
            System.err.println("DEBUG: Signup failed for: " + request.getEmail() + " - Error: " + e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/verify-signup-otp")
    public ResponseEntity<String> verifySignupOtp(@RequestBody VerifySignupOtpRequest request) {
        authService.verifySignupOtp(request);
        return ResponseEntity.ok("Verification successful. You can now login.");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);

        // Create Cookie
        Cookie cookie = new Cookie("token", loginResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 hours

        response.addCookie(cookie);

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        authService.sendResetOtp(request.getEmail());
        return ResponseEntity.ok("OTP sent to email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successful");
    }
}
