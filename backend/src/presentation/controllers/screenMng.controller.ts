import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { IScreenManagementController } from '../controllers/interface/screenMng.controller.interface';
import { ICreateScreenUseCase } from '../../domain/interfaces/useCases/Vendor/createScreen.interface';
import { IUpdateScreenUseCase } from '../../domain/interfaces/useCases/Vendor/updateScreen.interface';
import { IFetchScreensOfVendorUseCase } from '../../domain/interfaces/useCases/Vendor/fetchScreenOfVendor.interface';

/**
 * Controller for managing screen-related operations, primarily for vendors.
 * @implements {IScreenManagementController}
 */
@injectable()
export class ScreenManagementController implements IScreenManagementController {
  /**
   * Constructs an instance of ScreenManagementController.
   * @param {ICreateScreenUseCase} createScreenUseCase - Use case for creating a new screen.
   * @param {IUpdateScreenUseCase} updateScreenUseCase - Use case for updating an existing screen.
   * @param {IFetchScreensOfVendorUseCase} fetchScreensOfVendorUseCase - Use case for fetching screens belonging to a specific vendor.
   */
  constructor(
    @inject('CreateScreenUseCase') private createScreenUseCase: ICreateScreenUseCase,
    @inject('UpdateScreenUseCase') private updateScreenUseCase: IUpdateScreenUseCase,
    @inject('FetchScreensOfVendorUseCase')
    private fetchScreensOfVendorUseCase: IFetchScreensOfVendorUseCase,
  ) {}

  /**
   * Handles the creation of a new screen.
   * @param {Request} req - The Express request object, containing screen details in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async createScreen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const screen = await this.createScreenUseCase.execute(req.body);
      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, screen);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the update of an existing screen.
   * @param {Request} req - The Express request object, containing screen ID in `req.params.id` and updated screen details in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async updateScreen(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      const screen = await this.updateScreenUseCase.execute(id, req.body);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, screen);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches a list of screens belonging to a specific vendor, with pagination and filtering options.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` for the vendor ID and optional query parameters for filtering.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getScreensOfVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }
}
