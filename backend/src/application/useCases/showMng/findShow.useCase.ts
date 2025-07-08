import { inject, injectable } from 'tsyringe';
import { Show } from '../../../domain/entities/show.entity';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IFindShowByIdUseCase } from '../../../domain/interfaces/useCases/Vendor/findShowById.interface';

@injectable()
export class FindShowByIdUseCase implements IFindShowByIdUseCase {
  constructor(@inject('ShowRepository') private showRepository: IShowRepository) {}

  async execute(showId: string): Promise<Show | null> {
    try {
      return await this.showRepository.findById(showId);
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
