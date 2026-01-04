package com.github.issue.prioritization.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import com.github.issue.prioritization.config.jwt.JwtUtil;
import com.github.issue.prioritization.dto.*;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.UserRepository;
import com.github.issue.prioritization.service.AuthService;
import com.github.issue.prioritization.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    // ================= SIGNUP WITH OTP (UPDATED LOGIC) =================
    @Override
    public void signup(SignupRequest request) {

        User user;

        // 🔎 Check if email already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        // ================= CASE 1: EMAIL EXISTS =================
        if (existingUser.isPresent()) {

            user = existingUser.get();

            // ❌ Already verified → block signup
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                throw new RuntimeException("Email already registered and verified");
            }

            // 🔁 NOT verified → resend OTP
            String otp = generateOtp();

            user.setSignupOtp(otp);
            user.setSignupOtpExpiry(LocalDateTime.now().plusMinutes(10));

            userRepository.save(user);
            emailService.sendOtp(user.getEmail(), otp);

            return;
        }

        // ================= CASE 2: NEW USER =================
        user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(false);

        String otp = generateOtp();
        user.setSignupOtp(otp);
        user.setSignupOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);
        emailService.sendOtp(user.getEmail(), otp);
    }

    // ================= VERIFY SIGNUP OTP =================
    @Override
    public void verifySignupOtp(VerifySignupOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getSignupOtp() == null ||
                !user.getSignupOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getSignupOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        // ✅ Mark verified
        user.setEmailVerified(true);
        user.setSignupOtp(null);
        user.setSignupOtpExpiry(null);

        userRepository.save(user);
    }

    // ================= LOGIN =================
    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email not verified");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        UserDto userDto = new UserDto(user.getUserId(), user.getName(), user.getEmail());
        return new LoginResponse(token, userDto);
    }

    // ================= FORGOT PASSWORD =================
    @Override
    public void sendResetOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        String otp = generateOtp();

        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);
        emailService.sendOtp(email, otp);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (!request.getOtp().equals(user.getResetOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);

        userRepository.save(user);
    }

    // ================= OTP GENERATOR =================
    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}
