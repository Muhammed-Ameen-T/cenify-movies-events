export interface ISendOtpAdminUseCase {
  execute(email: string): Promise<void>;
}
