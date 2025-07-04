import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { IForgotPasswordUpdateUseCase } from '../../../domain/interfaces/useCases/Admin/forgotPasswordUpdate.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { hashPassword } from '../../../utils/helpers/hash.utils';

/**
 * Use case for updating the user's password after OTP verification.
 */
@injectable()
export class ForgotPasswordUpdateUseCase implements IForgotPasswordUpdateUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<void> {
    1;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    try {
      const hashedPassword = await hashPassword(password);
      await this.userRepository.updatePassword(email, hashedPassword);
      console.log('UpdatePasswordUseCase: Password updated for:', email);
    } catch (error) {
      console.error('UpdatePasswordUseCase: Error updating password:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_TO_UPDATE_PASSWORD,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
