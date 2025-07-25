import { inject, injectable } from 'tsyringe';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IFindTheaterByIdUseCase } from '../../../domain/interfaces/useCases/Vendor/findTheaterById.interface';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { Theater } from '../../../domain/entities/theater.entity';

@injectable()
export class FindTheaterByIdUseCase implements IFindTheaterByIdUseCase {
  constructor(@inject('TheaterRepository') private theaterRepository: ITheaterRepository) {}

  async execute(theaterId: string): Promise<Theater | null> {
    try {
      return await this.theaterRepository.findById(theaterId);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
