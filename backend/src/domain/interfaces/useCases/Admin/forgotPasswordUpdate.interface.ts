export interface IForgotPasswordUpdateUseCase {
  execute(email: string, password: string): Promise<void>;
}
