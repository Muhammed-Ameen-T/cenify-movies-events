// src/application/useCases/User/updateUserProfile.useCase.ts
import { inject, injectable } from 'tsyringe';
import { IupdateUserProfileUseCase } from '../../../domain/interfaces/useCases/User/updateUserProfile.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { UpdateProfileRequestDTO, UserResponseDTO } from '../../dtos/user.dto';
import { User } from '../../../domain/entities/user.entity';

@injectable()
export class updateUserProfileUseCase implements IupdateUserProfileUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(id: string, data: UpdateProfileRequestDTO): Promise<UserResponseDTO> {
    // Fetch existing user
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    // Create updated user object
    const updatedUserData = new User(
      existingUser._id,
      data.name ?? existingUser.name,
      existingUser.email,
      data.phone !== undefined ? data.phone : existingUser.phone,
      existingUser.authId,
      existingUser.password,
      data.profileImage ?? existingUser.profileImage,
      data.dob !== undefined ? data.dob : existingUser.dob,
      existingUser.moviePass,
      existingUser.loyalityPoints,
      existingUser.isBlocked,
      existingUser.role,
      existingUser.createdAt,
      new Date(),
    );

    // Update user in repository
    const updatedUser = await this.userRepository.update(updatedUserData);

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
