import { LoginDTO } from '../../../../application/dtos/auth.dto';
import { AuthResponseDTO } from '../../../../application/dtos/auth.dto';

export interface ILoginUserUseCase {
  execute(dto: LoginDTO): Promise<AuthResponseDTO>;
}
