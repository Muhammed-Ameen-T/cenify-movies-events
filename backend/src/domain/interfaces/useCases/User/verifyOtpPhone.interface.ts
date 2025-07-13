import { VerifyOtpPhoneRequestDTO } from "../../../../application/dtos/profile.dto";

export interface IVerifyOtpPhoneUseCase {
  execute(dto:VerifyOtpPhoneRequestDTO): Promise<void>;
}