import { inject, injectable } from 'tsyringe';
import BookingModel from '../../../infrastructure/database/booking.model';
import WalletModel from '../../../infrastructure/database/wallet.model';
import { IProcessVendorPayout } from '../../../domain/interfaces/useCases/User/ProcessVendorPayoutUseCase.interface';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import dotenv from 'dotenv';
dotenv.config();

@injectable()
export class ProcessVendorPayoutUseCase implements IProcessVendorPayout {
  private readonly ADMIN_COMMISSION = 0.15;

  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('WalletRepository') private walletRepository: IWalletRepository,
  ) {}

  async execute(): Promise<{ vendorId: string; gross: number; net: number }[]> {
    const bookings = await BookingModel.aggregate([
      {
        $match: {
          status: 'confirmed',
          'payment.status': 'completed',
        },
      },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'showDetails',
        },
      },
      { $unwind: '$showDetails' },
      {
        $match: {
          'showDetails.status': { $in: ['Running', 'Completed'] },
        },
      },
      {
        $group: {
          _id: '$showDetails.vendorId',
          totalRevenue: { $sum: '$payment.amount' },
        },
      },
    ]);

    const result: { vendorId: string; gross: number; net: number }[] = [];

    for (const vendor of bookings) {
      const vendorId = vendor._id.toString();
      const gross = vendor.totalRevenue;
      const net = gross * (1 - this.ADMIN_COMMISSION);

      await this.walletRepository.pushTransactionAndUpdateBalance(vendor._id, {
        amount: net,
        type: 'credit',
        source: 'booking',
        remark: `Monthly payout after ${this.ADMIN_COMMISSION * 100}% commission`,
        createdAt: new Date(),
      });

      const targetUserId = process.env.ADMIN_USER_ID || '681a66250869b998bbad2545';

      await this.walletRepository.pushTransactionAndUpdateBalance(targetUserId, {
        amount: net,
        type: 'debit',
        source: 'booking',
        remark: `Monthly payout transferred to vendor ${vendor._id}, credited ₹${net}`,
        createdAt: new Date(),
      });

      result.push({ vendorId, gross, net });
    }

    return result;
  }
}
