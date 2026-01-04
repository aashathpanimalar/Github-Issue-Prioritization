package com.github.issue.prioritization.service.impl;

import com.github.issue.prioritization.service.EmailService;
import com.github.issue.prioritization.util.OtpEmailTemplate;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendOtp(String toEmail, String otp) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your OTP Code");

            String htmlContent = OtpEmailTemplate.buildOtpEmail(
                    otp,
                    "Account Verification / Password Reset");
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send OTP email to " + toEmail);
            System.out.println("DEBUG OTP: Your OTP code is " + otp);
            // We don't throw an exception here so the user can still proceed
            // by checking the console logs in development.
        }
    }
}
