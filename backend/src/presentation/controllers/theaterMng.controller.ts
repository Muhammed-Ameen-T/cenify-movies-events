import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
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
import { IFetchAdminTheatersUseCase } from '../../domain/interfaces/useCases/Admin/fetchAdminTheaters.interface';

@injectable()
export class TheaterManagementController implements ITheaterManagementController {
  constructor(
    @inject('FetchTheaterOfVendorUseCase')
    private fetchTheaterUseCase: IFetchTheaterOfVendorUseCase,
    @inject('FetchTheatersUseCase') private fetchTheatersUseCase: IFetchTheatersUseCase,
    @inject('UpdateTheaterStatus') private updateTheaterStatusUseCase: IUpdateTheaterStatusUseCase,
    @inject('FetchAdminTheatersUseCase')
    private fetchAdminTheatersUseCase: IFetchAdminTheatersUseCase,
    @inject('UpdateTheater') private updateTheaterUseCase: IUpdateTheaterUseCase,
  ) {}

  async getTheaters(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const theaters = await this.fetchTheatersUseCase.execute();
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, theaters);
    } catch (error) {
      next(error)
    }
  }

  async updateTheaterStatus(req: Request, res: Response, next:NextFunction): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;

    try {
      await this.updateTheaterStatusUseCase.execute(id, status, res);
    } catch (error) {
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to update status');
    }
  }

  async updateTheater(req: Request, res: Response, next:NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      await this.updateTheaterUseCase.execute(id, req.body, res);
    } catch (error) {
next(error)    }
  }
  /**
   * Fetches theaters for a specific vendor.
   * @param req - The request object.
   * @param res - The response object.
   * @returns A promise that resolves to void.
   */
  getTheatersOfVendor = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
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
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error)
    }
  };

  async fetchTheatersByAdmin(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, features, rating, location, sortBy, sortOrder } =
        req.query;

      // Build params object from query parameters
      const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        features: features ? (features as string).split(',') : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        location: location ? (location as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      // Fetch theaters using the use case
      const result = await this.fetchAdminTheatersUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error)
    }
  }
}
