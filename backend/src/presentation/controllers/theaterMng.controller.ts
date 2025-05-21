import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { ITheaterManagementController } from './interface/theaterMng.controller.interface';
import { IUpdateTheaterStatusUseCase } from '../../domain/interfaces/useCases/Vendor/updateTheaterStatus.interface';
import { IFetchTheaterOfVendorUseCase } from '../../domain/interfaces/useCases/Vendor/fetchTheatersOfVendor.interface';
import { IUpdateTheaterUseCase } from '../../domain/interfaces/useCases/Vendor/updateTheater.interfase';
import { IFetchTheatersUseCase } from '../../domain/interfaces/useCases/Vendor/fetchTheaters.interface';

@injectable()
export class TheaterManagementController implements ITheaterManagementController {
  constructor(
    @inject('FetchTheaterOfVendorUseCase') private fetchTheaterUseCase: IFetchTheaterOfVendorUseCase,
    @inject('FetchTheatersUseCase') private fetchTheatersUseCase: IFetchTheatersUseCase,
    @inject('UpdateTheaterStatus') private updateTheaterStatusUseCase: IUpdateTheaterStatusUseCase,
    @inject('UpdateTheater') private updateTheaterUseCase: IUpdateTheaterUseCase,
  ) {}

  async getTheaters(req: Request, res: Response): Promise<void> {
    try {
      const theaters = await this.fetchTheatersUseCase.execute();
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, theaters);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.GENERAL.FAILED_FETCHING_THEATERS;
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
    }
  }

  async updateTheaterStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;

    try {
      await this.updateTheaterStatusUseCase.execute(id, status, res);
    } catch (error) {
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to update status');
    }
  }

  async updateTheater(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log("🚀 ~ TheaterManagementController ~ updateTheater ~  req.body:",  )

    try {
      await this.updateTheaterUseCase.execute(id, req.body, res);
    } catch (error) {
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to update status');
    }
  }
  /**
   * Fetches theaters for a specific vendor.
   * @param req - The request object.
   * @param res - The response object.
   * @returns A promise that resolves to void.
   */
  getTheatersOfVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, search, status, location, sortBy, sortOrder } = req.query;
      const vendorId = req.decoded?.userId; 
      if (!vendorId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      // Convert query parameters directly
      const params = {
        vendorId,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        location: location ? (location as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      // Fetch theaters using the use case
      const result = await this.fetchTheaterUseCase.execute(params);
      console.log("🚀 ~ TheaterManagementController ~ getTheatersOfVendor= ~ result:", result)
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.GENERAL.FAILED_FETCHING_THEATERS;
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
    }
  };          
}