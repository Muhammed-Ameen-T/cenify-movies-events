import { SendOtpVendorDTO } from '../../../../application/dtos/vendor.dto';

export interface ISendOtpVendorUseCase {
  execute(dto: SendOtpVendorDTO): Promise<void>;
}
