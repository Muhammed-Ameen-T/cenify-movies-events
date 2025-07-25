// src/domain/interfaces/useCases/Payment/checkPaymentOptions.interface.ts
export interface ICheckPaymentOptionsUseCase {
  execute(
    userId: string,
    totalAmount: number,
  ): Promise<{
    wallet: { enabled: boolean; balance: number };
    stripe: { enabled: boolean };
    moviePass: { active: boolean };
  }>;
}
