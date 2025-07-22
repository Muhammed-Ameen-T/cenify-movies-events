import { SendOtpPhoneRequestDTO } from '../../../../application/dtos/profile.dto';

export interface ISendOtpPhoneUseCase {
  execute(dto: SendOtpPhoneRequestDTO): Promise<void>;
}
