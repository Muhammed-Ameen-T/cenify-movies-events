"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = void 0;
const nodemailer_service_1 = require("./nodemailer.service");
/**
 * Sends an OTP email to a user.
 * @param {string} email - Recipient email.
 * @param {string} otp - OTP code.
 */
const sendOtp = async (email, otp) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background-color: #f8f9fa; text-align: center;">
      <h2>🔐 Your OTP Code</h2>
      <p>Use this code to verify your login:</p>
      <strong style="font-size: 20px; color: #007bff;">${otp}</strong>
      <p style="color: #ff4444;">⚠️ This OTP expires in 5 minutes.</p>
    </div>
  `;
    await nodemailer_service_1.EmailService.sendEmail(email, 'Your OTP Code', htmlContent);
};
exports.sendOtp = sendOtp;
