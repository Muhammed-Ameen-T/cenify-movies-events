import { inject, injectable } from 'tsyringe';
import { Screen } from '../../../domain/entities/screen.entity';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { CreateScreenDTO } from '../../dtos/screen.dto';
import { ICreateScreenUseCase } from '../../../domain/interfaces/useCases/Vendor/createScreen.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';

@injectable()
export class CreateScreenUseCase implements ICreateScreenUseCase {
  constructor(
    @inject('ScreenRepository') private _screenRepository: IScreenRepository,
    @inject('TheaterRepository') private _theaterRepository: ITheaterRepository,
  ) {}

  async execute(dto: CreateScreenDTO): Promise<Screen> {
    const newScreen = new Screen(
      null,
      dto.name,
      new mongoose.Types.ObjectId(dto.theaterId),
      new mongoose.Types.ObjectId(dto.seatLayoutId),
      [],
      dto.amenities,
    );

    const existingScreenName = await this._screenRepository.findScreenByName(
      dto.name,
      dto.theaterId,
    );
    if (existingScreenName) {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.SCREEN_NAME_ALREADY_EXISTS,
        HttpResCode.BAD_REQUEST,
      );
    }

    try {
      const savedScreen = await this._screenRepository.create(newScreen);
      await this._theaterRepository.updateScreens(
        savedScreen.theaterId?.toString() || '',
        savedScreen._id?.toString() || '',
        'push',
      );
      return savedScreen;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
