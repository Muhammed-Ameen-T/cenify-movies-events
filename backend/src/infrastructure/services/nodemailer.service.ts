import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env.config';

class NodemailerService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
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
  async sendEmail(recipient: string, subject: string, htmlContent: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.SMTP_USERNAME,
        to: recipient,
        subject,
        html: htmlContent,
      });
      console.log(`✅ Email sent to ${recipient}: ${subject}`);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }
}

export const EmailService = new NodemailerService();
