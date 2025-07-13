// src/domain/interfaces/useCases/User/updateUserProfile.interface.ts
import { UpdateProfileRequestDTO, UserResponseDTO } from '../../../../application/dtos/user.dto';

export interface IupdateUserProfileUseCase {
  execute(id: string, data: UpdateProfileRequestDTO): Promise<UserResponseDTO>;
}
