import { AuthResponseDTO } from '../../../../application/dtos/auth.dto';
import { VerifyOtpDTO } from '../../../../application/dtos/auth.dto';

export interface IVerifyOtpUseCase {
  execute(dto: VerifyOtpDTO): Promise<AuthResponseDTO>;
}
