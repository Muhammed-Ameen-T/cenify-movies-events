import { Transaction, Wallet } from '../../../entities/wallet.entity';

export interface IRedeemLoyalityToWalletUseCase {
  execute(userId: string, amount: number): Promise<Wallet>;
}
