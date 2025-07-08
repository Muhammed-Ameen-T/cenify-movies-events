export interface IForgotPasswordSendOtpUseCase {
  execute(email: string): Promise<void>;
}
