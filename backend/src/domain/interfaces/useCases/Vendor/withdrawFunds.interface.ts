// src/domain/interfaces/useCases/Wallet/withdrawFunds.interface.ts
export interface IWithdrawFundsUseCase {
  execute(
    userId: string,
    amount: number,
    stripeAccountId: string,
  ): Promise<{
    success: boolean;
    balance: number;
  }>;
}
