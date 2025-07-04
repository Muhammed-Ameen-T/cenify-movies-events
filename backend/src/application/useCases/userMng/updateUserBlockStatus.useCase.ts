// src/useCases/Admin/updateUserBlockStatus.useCase.ts
import { injectable, inject } from 'tsyringe';
import { Response } from 'express';
import { IUpdateUserBlockStatusUseCase } from '../../../domain/interfaces/useCases/Admin/updateUserBlockStatus.interface';
import { UpdateUserBlockStatusDTO } from '../../dtos/user.dto';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { sendResponse } from '../../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../../utils/errors/custom.error';

@injectable()
export class UpdateUserBlockStatusUseCase implements IUpdateUserBlockStatusUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(id: string, data: UpdateUserBlockStatusDTO, res: Response): Promise<void> {
    try {
      // Validate isBlocked
      // if (typeof data.isBlocked !== 'boolean') {
      //   throw new CustomError(
      //     ERROR_MESSAGES.VALIDATION.INVALID_STATUS,
      //     HttpResCode.BAD_REQUEST,
      //   );
      // }

      // Check if user exists
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
      }

      // Update block status
      await this.userRepository.updateBlockStatus(id, data.isBlocked);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        message: `User ${data.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      });
    } catch (error) {
      console.error('UpdateUserBlockStatusUseCase error:', error);
      if (error instanceof CustomError) {
        sendResponse(res, error.statusCode, error.message);
      } else {
        sendResponse(
          res,
          HttpResCode.INTERNAL_SERVER_ERROR,
          ERROR_MESSAGES.GENERAL.FAILED_UPDATING_BLOCK_STATUS,
        );
      }
    }
  }
}
