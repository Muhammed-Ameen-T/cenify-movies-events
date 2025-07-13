import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { ISeatLayoutController } from './interface/seatLayoutMng.controller.interface';
import { ICreateSeatLayoutUseCase } from '../../domain/interfaces/useCases/Vendor/createSeatLayout.interface';
import { CreateSeatLayoutDTO, UpdateSeatLayoutDTO } from '../../application/dtos/seatLayout';
import { IFindSeatLayoutsByVendorUseCase } from '../../domain/interfaces/useCases/Vendor/fetchLayoutsVendor.interface';
import { IUpdateSeatLayoutUseCase } from '../../domain/interfaces/useCases/Vendor/updateSeatLayoutUseCase';
import { IFindSeatLayoutByIdUseCase } from '../../domain/interfaces/useCases/Vendor/findSeatLayoutById.interface';

@injectable()
export class SeatLayoutController implements ISeatLayoutController {
  constructor(
    @inject('CreateSeatLayoutUseCase') private createSeatLayoutUseCase: ICreateSeatLayoutUseCase,
    @inject('UpdateSeatLayoutUseCase') private updateSeatLayoutUseCase: IUpdateSeatLayoutUseCase,
    @inject('FindSeatLayoutsByVendorUseCase')
    private findSeatLayoutsByVendorUseCase: IFindSeatLayoutsByVendorUseCase,
    @inject('FindSeatLayoutByIdUseCase')
    private findSeatLayoutByIdUseCase: IFindSeatLayoutByIdUseCase,
  ) {}

  async createSeatLayout(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { uuid, vendorId, layoutName, seatPrice, rowCount, columnCount, seats, capacity } =
        req.body;
      const dto = new CreateSeatLayoutDTO(
        uuid,
        vendorId,
        layoutName,
        seatPrice,
        rowCount,
        columnCount,
        seats,
        capacity,
      );
      await this.createSeatLayoutUseCase.execute(dto, res);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async updateSeatLayout(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { uuid, layoutName, seatPrice, rowCount, columnCount, seats, capacity } = req.body;
      const layoutId = req.params.id;
      const dto = new UpdateSeatLayoutDTO(
        layoutId,
        uuid,
        layoutName,
        seatPrice,
        rowCount,
        columnCount,
        seats,
        capacity,
      );
      await this.updateSeatLayoutUseCase.execute(dto, res);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_UPDATED;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async findSeatLayoutsByVendor(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const vendorId = req.decoded?.userId;
      if (!vendorId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const { page, limit, search, sortBy, sortOrder } = req.query;

      const params = {
        vendorId,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.findSeatLayoutsByVendorUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.GENERAL.FAILED_FETCHING_RECORDS;
      sendResponse(
        res,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
        errorMessage,
      );
    }
  }

  async findSeatLayoutById(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const layoutId = req.params.id;
      if (!layoutId) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.INVALID_SEAT_LAYOUT_ID,
          HttpResCode.BAD_REQUEST,
        );
      }

      const seatLayout = await this.findSeatLayoutByIdUseCase.execute(layoutId, res);
      if (!seatLayout) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.SEAT_LAYOUT_NOT_FOUND, HttpResCode.NOT_FOUND);
      }

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, seatLayout);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.GENERAL.FAILED_FETCHING_RECORDS;
      sendResponse(
        res,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
        errorMessage,
      );
    }
  }
}
