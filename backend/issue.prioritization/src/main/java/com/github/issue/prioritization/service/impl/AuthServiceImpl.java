package com.github.issue.prioritization.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import com.github.issue.prioritization.config.jwt.JwtUtil;
import com.github.issue.prioritization.dto.LoginResponse;
import com.github.issue.prioritization.dto.ResetPasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.github.issue.prioritization.dto.LoginRequest;
import com.github.issue.prioritization.dto.SignupRequest;
import com.github.issue.prioritization.entity.User;
import com.github.issue.prioritization.repository.UserRepository;
import com.github.issue.prioritization.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void signup(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(false);

        userRepository.save(user);
    }

//    @Override
//    public void login(LoginRequest request) {
//
//        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
//
//        if (userOpt.isEmpty()) {
//            throw new RuntimeException("Invalid email or password");
//        }
//
//        User user = userOpt.get();
//
//        // BCrypt password comparison
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid email or password");
//        }
//
//        // Login success (JWT will be added later)
//    }

    @Override
    public void sendResetOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        // Generate 6 digit OTP
        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        // TEMP: Console log (replace with email later)
        System.out.println("Reset OTP for " + email + " is: " + otp);
    }


    @Override
    public void resetPassword(ResetPasswordRequest request) {


        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email"));
        System.out.println("DB OTP      : " + user.getResetOtp());
        System.out.println("Request OTP : " + request.getOtp());
        System.out.println("Expiry Time : " + user.getResetOtpExpiry());
        System.out.println("Now Time    : " + LocalDateTime.now());


        if (user.getResetOtp() == null ||
                !user.getResetOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        // Encrypt new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Clear OTP after success
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);

        userRepository.save(user);
    }

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // ✅ Generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(token);
    }


}
