export interface ISendOtp {
  sendOtp(email: string, otp: string): Promise<void>;
}
