package com.github.issue.prioritization.util;

public class OtpEmailTemplate {

    public static String buildOtpEmail(String otp, String purpose) {

        return """
            <html>
            <body style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
                <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px;">
                    
                    <h2 style="color:#333;">GitHub Issue Prioritization System</h2>

                    <p>Hello,</p>

                    <p>
                        Your One-Time Password (OTP) for <b>%s</b> is:
                    </p>

                    <div style="font-size:28px; font-weight:bold; 
                                letter-spacing:4px; color:#2c3e50;
                                margin:20px 0;">
                        %s
                    </div>

                    <p>This OTP is valid for <b>10 minutes</b>.</p>

                    <p>If you did not request this, please ignore this email.</p>

                    <br/>

                    <p style="font-size:12px; color:#777;">
                        Regards,<br/>
                        GitHub Issue Prioritization Team
                    </p>

                </div>
            </body>
            </html>
        """.formatted(purpose, otp);
    }
}
