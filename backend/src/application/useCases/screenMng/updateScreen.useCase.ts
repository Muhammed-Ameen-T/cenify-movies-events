import { inject, injectable } from 'tsyringe';
import { Screen } from '../../../domain/entities/screen.entity';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { UpdateScreenDTO } from '../../dtos/screen.dto';
import { IUpdateScreenUseCase } from '../../../domain/interfaces/useCases/Vendor/updateScreen.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import mongoose, { Types } from 'mongoose';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';

@injectable()
export class UpdateScreenUseCase implements IUpdateScreenUseCase {
  constructor(
    @inject('ScreenRepository') private screenRepository: IScreenRepository,
    @inject('TheaterRepository') private theaterRepository: ITheaterRepository,
  ) {}

  async execute(id: string, dto: UpdateScreenDTO): Promise<Screen> {
    try {
      const existingScreen = await this.screenRepository.findById(id);
      if (!existingScreen) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
      }

      const existingScreenName = await this.screenRepository.findScreenByName(
        dto.name,
        dto.theaterId,
        id,
      );
      if (existingScreenName) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.SCREEN_NAME_ALREADY_EXISTS,
          HttpResCode.BAD_REQUEST,
        );
      }

      let theaterId: Types.ObjectId | null = existingScreen.theaterId;
      if (dto.theaterId && dto.theaterId !== existingScreen.theaterId?.toString()) {
        if (!mongoose.Types.ObjectId.isValid(dto.theaterId)) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_THEATER_ID,
            HttpResCode.BAD_REQUEST,
          );
        }
        theaterId = new mongoose.Types.ObjectId(dto.theaterId);
      }

      let seatLayoutId: Types.ObjectId | null = existingScreen.seatLayoutId;
      if (dto.seatLayoutId) {
        if (!mongoose.Types.ObjectId.isValid(dto.seatLayoutId)) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_SEAT_LAYOUT_ID,
            HttpResCode.BAD_REQUEST,
          );
        }
        seatLayoutId = new mongoose.Types.ObjectId(dto.seatLayoutId);
      }

      const oldTheaterId = existingScreen.theaterId?._id.toString() || '';

      const updatedScreen = new Screen(
        id,
        dto.name || existingScreen.name,
        theaterId,
        seatLayoutId,
        existingScreen.filledTimes,
        {
          is3D: dto.amenities.is3D ?? existingScreen.amenities.is3D,
          is4K: dto.amenities.is4K ?? existingScreen.amenities.is4K,
          isDolby: dto.amenities.isDolby ?? existingScreen.amenities.isDolby,
        },
        existingScreen.createdAt,
        new Date(),
      );

      const savedScreen = await this.screenRepository.updateScreenDetails(updatedScreen);
      if (!savedScreen) {
        throw new CustomError(
          ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
          HttpResCode.INTERNAL_SERVER_ERROR,
        );
      }
      if (oldTheaterId !== savedScreen.theaterId?._id.toString()) {
        await this.theaterRepository.updateScreens(
          oldTheaterId,
          savedScreen._id?.toString() || '',
          'pull',
        );
        await this.theaterRepository.updateScreens(
          savedScreen.theaterId?._id.toString() || '',
          savedScreen._id?.toString() || '',
          'push',
        );
      }

      return savedScreen;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.FAILED_UPDATING_RECORD,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
