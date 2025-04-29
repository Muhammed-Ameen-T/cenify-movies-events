// src/application/use-cases/updateTheaterStatusUseCase.ts
import { IVendorRepository } from '../../../domain/interfaces/repositories/vendor.repository';
import { VendorResponseDTO } from '../../dtos/vendor.dto';
import { sendResponse } from '../../../utils/response/sendResponse.utils';
import { Response } from 'express';
import { HttpResMsg,HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { IUpdateTheaterStatusUseCase } from '../../../domain/interfaces/useCases/Vendor/updateTheaterStatus.interface';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UpdateTheaterStatusUseCase implements IUpdateTheaterStatusUseCase{
    constructor(@inject('VendorRepository') private vendorRepository: IVendorRepository) {}

  async execute(id: string, status: string, res: Response): Promise<void> {
    const validStatuses = ['active', 'blocked', 'verified', 'verifying', 'pending', 'request'];
    if (!validStatuses.includes(status)) {
      sendResponse(res, HttpResCode.BAD_REQUEST, 'Invalid status');
      return;
    }

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      sendResponse(res, HttpResCode.NOT_FOUND, 'Theater not found');
      return;
    }

    vendor.status = status;
    vendor.updatedAt = new Date();
    await this.vendorRepository.updateVerificationStatus(id, vendor);

    const responseDTO = new VendorResponseDTO(
      vendor._id.toString(),
      vendor.name,
      vendor.status,
      vendor.location,
      vendor.facilities,
      vendor.intervalTime,
      vendor.gallery,
      vendor.email,
      vendor.phone,
      vendor.rating,
      vendor.accountType,
      vendor.createdAt,
      vendor.updatedAt,
    );

    sendResponse(res, HttpResCode.OK, 'Status updated successfully', responseDTO);
  }
}