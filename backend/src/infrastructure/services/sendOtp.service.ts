import { EmailService } from './nodemailer.service';

/**
 * Sends an OTP email to a user.
 * @param {string} email - Recipient email.
 * @param {string} otp - OTP code.
 */
export const sendOtp = async (email: string, otp: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background-color: #f8f9fa; text-align: center;">
      <h2>🔐 Your OTP Code</h2>
      <p>Use this code to verify your login:</p>
      <strong style="font-size: 20px; color: #007bff;">${otp}</strong>
      <p style="color: #ff4444;">⚠️ This OTP expires in 5 minutes.</p>
    </div>
  `;

  await EmailService.sendEmail(email, 'Your OTP Code', htmlContent);
};
