export interface ISendOtpUseCase {
  execute(email: string): Promise<void>;
}
