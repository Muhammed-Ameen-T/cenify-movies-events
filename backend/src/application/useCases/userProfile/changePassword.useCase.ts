import { inject, injectable } from 'tsyringe';
import { IChangePasswordUseCase } from '../../../domain/interfaces/useCases/User/changePassword.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { ChangePasswordRequestDTO, UserResponseDTO } from '../../dtos/user.dto';
import bcrypt from 'bcryptjs';
import { hashPassword } from '../../../utils/helpers/hash.utils';

@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(dto: ChangePasswordRequestDTO): Promise<UserResponseDTO> {
    // Fetch existing user
    const existingUser = await this.userRepository.findById(dto.userId);
    if (!existingUser) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    // Verify old password
    if (!existingUser.password) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.PASSWORD_NOT_FOUND,
        HttpResCode.BAD_REQUEST,
      );
    }
    const isPasswordValid = await bcrypt.compare(dto.oldPassword, existingUser.password);
    if (!isPasswordValid) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.OLD_PASSWORD_INVALID,
        HttpResCode.BAD_REQUEST,
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(dto.newPassword);

    const updatedUser = await this.userRepository.updatePasswordById(dto.userId, hashedNewPassword);

    // Return UserResponseDTO
    return new UserResponseDTO(
      updatedUser._id.toString(),
      updatedUser.name,
      updatedUser.email,
      updatedUser.phone,
      updatedUser.role,
      updatedUser.isBlocked,
      updatedUser.createdAt.toISOString(),
      updatedUser.updatedAt.toISOString(),
      updatedUser.profileImage,
    );
  }
}
