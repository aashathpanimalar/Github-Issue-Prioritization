package com.github.issue.prioritization.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(name = "email_verified")
    private Boolean emailVerified;

    // 🔹 Signup OTP
    @Column(name = "signup_otp")
    private String signupOtp;

    @Column(name = "signup_otp_expiry")
    private LocalDateTime signupOtpExpiry;

    // 🔹 Forgot password OTP
    private String resetOtp;
    private LocalDateTime resetOtpExpiry;

    // getters & setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getSignupOtp() {
        return signupOtp;
    }

    public void setSignupOtp(String signupOtp) {
        this.signupOtp = signupOtp;
    }

    public LocalDateTime getSignupOtpExpiry() {
        return signupOtpExpiry;
    }

    public void setSignupOtpExpiry(LocalDateTime signupOtpExpiry) {
        this.signupOtpExpiry = signupOtpExpiry;
    }

    public String getResetOtp() {
        return resetOtp;
    }

    public void setResetOtp(String resetOtp) {
        this.resetOtp = resetOtp;
    }

    public LocalDateTime getResetOtpExpiry() {
        return resetOtpExpiry;
    }

    public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) {
        this.resetOtpExpiry = resetOtpExpiry;
    }

}
