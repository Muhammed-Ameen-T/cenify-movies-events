import { injectable } from 'tsyringe';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import Twilio from 'twilio';
import { env } from '../../config/env.config';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

@injectable()
export class SmsService {
  private client: Twilio.Twilio;

  constructor() {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.TWILIO_CONFIG_MISSING,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    this.client = Twilio(accountSid, authToken);
  }

  async sendSms(phone: string, message: string): Promise<void> {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const twilioPhone = env.TWILIO_PHONE;

      if (!twilioPhone) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.TWILIO_PHONE_MISSING,
          HttpResCode.INTERNAL_SERVER_ERROR,
        );
      }

      await this.client.messages.create({
        body: message,
        from: twilioPhone,
        to: formattedPhone,
      });

      console.log(`SMS sent to ${formattedPhone}: ${message}`);
    } catch (error: any) {
      console.error('SmsService: Failed to send SMS:', error);
      throw new CustomError(
        error.message || ERROR_MESSAGES.GENERAL.FAILE_SENDING_SMS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
