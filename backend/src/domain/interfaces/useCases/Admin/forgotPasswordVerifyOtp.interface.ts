export interface IForgotPasswordVerifyOtpUseCase {
  execute(email: string, otp: string): Promise<void>;
}
