"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_config_1 = require("../../config/env.config");
class NodemailerService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: env_config_1.env.SMTP_HOST,
            port: env_config_1.env.SMTP_PORT,
            secure: env_config_1.env.SMTP_SECURE,
            auth: {
                user: env_config_1.env.SMTP_USERNAME,
                pass: env_config_1.env.SMTP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            socketTimeout: 10000,
        });
    }
    /**
     * Sends an email with a dynamic subject and content.
     * @param {string} recipient - Email recipient.
     * @param {string} subject - Email subject.
     * @param {string} htmlContent - Email body content in HTML format.
     * @returns {Promise<void>}
     */
    async sendEmail(recipient, subject, htmlContent) {
        try {
            await this.transporter.sendMail({
                from: env_config_1.env.SMTP_USERNAME,
                to: recipient,
                subject,
                html: htmlContent,
            });
            console.log(`✅ Email sent to ${recipient}: ${subject}`);
        }
        catch (error) {
            console.error('❌ Email sending failed:', error);
            throw new Error('Failed to send email');
        }
    }
}
exports.EmailService = new NodemailerService();
