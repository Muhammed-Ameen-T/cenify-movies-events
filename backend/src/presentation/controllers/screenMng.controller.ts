import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { IScreenManagementController } from '../controllers/interface/screenMng.controller.interface';
import { ICreateScreenUseCase } from '../../domain/interfaces/useCases/Vendor/createScreen.interface';
import { IUpdateScreenUseCase } from '../../domain/interfaces/useCases/Vendor/updateScreen.interface';
import { IFetchScreensOfVendorUseCase } from '../../domain/interfaces/useCases/Vendor/fetchScreenOfVendor.interface';

@injectable()
export class ScreenManagementController implements IScreenManagementController {
  constructor(
    @inject('CreateScreenUseCase') private createScreenUseCase: ICreateScreenUseCase,
    @inject('UpdateScreenUseCase') private updateScreenUseCase: IUpdateScreenUseCase,
    @inject('FetchScreensOfVendorUseCase') private fetchScreensOfVendorUseCase: IFetchScreensOfVendorUseCase
  ) {}

  async createScreen(req: Request, res: Response): Promise<void> {
    try {
      console.log("🚀 ~ ScreenManagementController ~ createScreen ~ req.body:", req.body)
      const screen = await this.createScreenUseCase.execute(req.body);
      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, screen);
    } catch (error:any) {
      sendResponse(res, HttpResCode.BAD_REQUEST, error.message);
    }
  }

  async updateScreen(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const screen = await this.updateScreenUseCase.execute(id, req.body);
      console.log("🚀 ~ ScreenManagementController ~ updateScreen ~ screen:", screen)
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, screen);
    } catch (error:any) {
      sendResponse(res, HttpResCode.BAD_REQUEST, error.message);
    }
  }

  async getScreensOfVendor(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, theaterId, sortBy, sortOrder } = req.query;
      const vendorId = req.decoded?.userId; 

      if (!vendorId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const params = {
        vendorId,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        theaterId: theaterId ? (theaterId as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.fetchScreensOfVendorUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error:any) {
      console.error("🚀 ~ ScreenManagementController ~ getScreensOfVendor ~ error:", error)
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}