import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { TheaterResponseDTO } from '../../dtos/vendor.dto';
import { sendResponse } from '../../../utils/response/sendResponse.utils';
import { Response } from 'express';
import { HttpResMsg, HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { IUpdateTheaterStatusUseCase } from '../../../domain/interfaces/useCases/Vendor/updateTheaterStatus.interface';
import { inject, injectable } from 'tsyringe';
import { SuccessMsg } from '../../../utils/constants/commonSuccessMsg.constants';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class UpdateTheaterStatusUseCase implements IUpdateTheaterStatusUseCase {
  constructor(@inject('TheaterRepository') private vendorRepository: ITheaterRepository) {}

  async execute(id: string, status: string, res: Response): Promise<void> {
    const validStatuses = ['active', 'blocked', 'verified', 'verifying', 'pending', 'request'];
    if (!validStatuses.includes(status)) {
      sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.INVALID_STATUS);
      return;
    }

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      sendResponse(res, HttpResCode.NOT_FOUND, HttpResMsg.THEATER_NOT_FOUND);
      return;
    }

    vendor.status = status;
    vendor.updatedAt = new Date();
    await this.vendorRepository.updateVerificationStatus(id, vendor);

    const responseDTO = new TheaterResponseDTO(
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
      vendor.ratingCount,
      vendor.description,
      null,
      vendor.createdAt,
      vendor.updatedAt,
    );

    sendResponse(res, HttpResCode.OK, SuccessMsg.STATUS_UPDATED, responseDTO);
  }
}
