import { inject, injectable } from 'tsyringe';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IDeleteShowUseCase } from '../../../domain/interfaces/useCases/Vendor/deleteShow.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class DeleteShowUseCase implements IDeleteShowUseCase {
  constructor(@inject('ShowRepository') private _showRepository: IShowRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingShow = await this._showRepository.findById(id);
      if (!existingShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      await this._showRepository.delete(id);
    } catch (error) {
      console.error('❌ Error deleting show:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_DELETED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
