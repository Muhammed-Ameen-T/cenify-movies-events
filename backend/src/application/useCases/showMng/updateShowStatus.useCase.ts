import { inject, injectable } from 'tsyringe';
import { Show } from '../../../domain/entities/show.entity';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IUpdateShowStatusUseCase } from '../../../domain/interfaces/useCases/Vendor/updateShowStatus.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class UpdateShowStatusUseCase implements IUpdateShowStatusUseCase {
  constructor(@inject('ShowRepository') private showRepository: IShowRepository) {}

  async execute(
    id: string,
    status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled',
  ): Promise<Show> {
    try {
      const existingShow = await this.showRepository.findById(id);
      if (!existingShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      return await this.showRepository.updateStatus(id, status);
    } catch (error) {
      console.error('❌ Error updating show status:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
