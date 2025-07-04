import { AuthResponseDTO } from '../../../../application/dtos/auth.dto';
import { VerifyOtpVendorDTO } from '../../../../application/dtos/vendor.dto';

export interface IVerifyOtpVendorUseCase {
  execute(dto: VerifyOtpVendorDTO): Promise<AuthResponseDTO>;
}
