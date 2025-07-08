import { LoginAdminDTO } from '../../../../application/dtos/auth.dto';
import { AuthResponseDTO } from '../../../../application/dtos/auth.dto';

export interface ILoginAdminUseCase {
  execute(dto: LoginAdminDTO): Promise<AuthResponseDTO>;
}
