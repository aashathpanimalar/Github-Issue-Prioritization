package com.github.issue.prioritization.service;

import com.github.issue.prioritization.dto.LoginRequest;
import com.github.issue.prioritization.dto.LoginResponse;
import com.github.issue.prioritization.dto.ResetPasswordRequest;
import com.github.issue.prioritization.dto.SignupRequest;
import com.github.issue.prioritization.dto.VerifySignupOtpRequest;

public interface AuthService {
    void signup(SignupRequest request);

    void verifySignupOtp(VerifySignupOtpRequest request);

    void sendResetOtp(String email);

    void resetPassword(ResetPasswordRequest request);

    LoginResponse login(LoginRequest request);
}
