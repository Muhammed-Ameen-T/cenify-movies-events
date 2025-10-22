// src/application/usecases/user/findProfileContents.usecase.ts

import { inject, injectable } from 'tsyringe';
import { IFindProfileContentsUseCase } from '../../../domain/interfaces/useCases/User/findProfileContents.interface';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { IBookingRepository } from '../../../domain/interfaces/repositories/booking.repository';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FindProfileContentsUseCase implements IFindProfileContentsUseCase {
  constructor(
    @inject('WalletRepository') private _walletRepository: IWalletRepository,
    @inject('BookingRepository') private _bookingRepository: IBookingRepository,
    @inject('MoviePassRepository') private _moviePassRepository: IMoviePassRepository,
  ) {}

  async execute(userId: string): Promise<{
    walletBalance: number;
    bookingsCount: number;
    moviePass: any;
  }> {
    if (!userId) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
    }

    const walletBalance = (await this._walletRepository.walletbalance(userId)) ?? 0;
    const bookingsCount = await this._bookingRepository.countBookings(userId);
    const moviePass = await this._moviePassRepository.findByUserId(userId);

    return {
      walletBalance,
      bookingsCount,
      moviePass,
    };
  }
}
