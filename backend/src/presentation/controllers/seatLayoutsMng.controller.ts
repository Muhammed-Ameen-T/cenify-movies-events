import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { ISeatLayoutController } from './interface/seatLayoutMng.controller.interface';
import { ICreateSeatLayoutUseCase } from '../../domain/interfaces/useCases/Vendor/createSeatLayout.interface';
import { CreateSeatLayoutDTO } from '../../application/dtos/seatLayout';

@injectable()
export class SeatLayoutController implements ISeatLayoutController {
  constructor(
    @inject('CreateSeatLayoutUseCase') private createSeatLayoutUseCase: ICreateSeatLayoutUseCase
  ) {}

  async createSeatLayout(req: Request, res: Response): Promise<void> {
    try {
      const { uuid, vendorId, layoutName, seatPrice, rowCount, columnCount, seats,capacity } = req.body;
      console.log("🚀 ~ SeatLayoutController ~ createSeatLayout ~ columnCount:", columnCount)
      const dto = new CreateSeatLayoutDTO(
        uuid,
        vendorId,
        layoutName,
        seatPrice,
        rowCount,
        columnCount,
        seats,
        capacity
      );
      await this.createSeatLayoutUseCase.execute(dto, res);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }
}