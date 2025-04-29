import { AuthResponseDTO, LoginAdminDTO } from '../../../../application/dtos/auth.dto';

export interface ILoginVendorUseCase {
  execute(dto: LoginAdminDTO): Promise<AuthResponseDTO>;
}
