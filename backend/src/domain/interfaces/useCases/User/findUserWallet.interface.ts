import { Wallet } from '../../../entities/wallet.entity';

export interface IFindUserWalletUseCase {
  execute(userId: string): Promise<Wallet>;
}
