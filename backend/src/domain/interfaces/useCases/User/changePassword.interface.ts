import { ChangePasswordRequestDTO, UserResponseDTO } from '../../../../application/dtos/user.dto';

export interface IChangePasswordUseCase {
  execute(dto: ChangePasswordRequestDTO): Promise<UserResponseDTO>;
}
