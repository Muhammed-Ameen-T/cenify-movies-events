import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { IShowManagementController } from './interface/showMng.controller.interface';
import { ICreateShowUseCase } from '../../domain/interfaces/useCases/Vendor/createShow.interface';
import { IUpdateShowUseCase } from '../../domain/interfaces/useCases/Vendor/updateShow.interface';
import { IUpdateShowStatusUseCase } from '../../domain/interfaces/useCases/Vendor/updateShowStatus.interface';
import { IDeleteShowUseCase } from '../../domain/interfaces/useCases/Vendor/deleteShow.interface';
import { IFindShowByIdUseCase } from '../../domain/interfaces/useCases/Vendor/findShowById.interface';
import { IFindAllShowsUseCase } from '../../domain/interfaces/useCases/Vendor/fetchAllShow.interface';
import { IFindShowsByVendorUseCase } from '../../domain/interfaces/useCases/Vendor/fetchVendorShows.interface';
import { IFetchShowSelectionUseCase } from '../../domain/interfaces/useCases/User/fetchShowSelection.interface';
import { ICreateRecurringShowUseCase } from '../../domain/interfaces/useCases/Vendor/createRecurringShow.interface';
import { ShowJobService } from '../../infrastructure/services/showAgenda.service';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';

/**
 * Controller for managing movie shows, including creation, updates, deletion, and fetching for both vendors and users.
 * @implements {IShowManagementController}
 */
@injectable()
export class ShowManagementController implements IShowManagementController {
  /**
   * Constructs an instance of ShowManagementController.
   * @param {ICreateShowUseCase} createShowUseCase - Use case for creating a new show.
   * @param {IUpdateShowUseCase} updateShowUseCase - Use case for updating an existing show.
   * @param {IUpdateShowStatusUseCase} updateShowStatusUseCase - Use case for updating a show's status.
   * @param {IDeleteShowUseCase} deleteShowUseCase - Use case for deleting a show.
   * @param {IFindShowByIdUseCase} findShowByIdUseCase - Use case for finding a show by ID.
   * @param {IFindAllShowsUseCase} findAllShowsUseCase - Use case for fetching all shows (admin view).
   * @param {IFindShowsByVendorUseCase} findShowsByVendorUseCase - Use case for fetching shows by a specific vendor.
   * @param {IFetchShowSelectionUseCase} fetchShowSelectionUseCase - Use case for fetching show selection options for users.
   * @param {ICreateRecurringShowUseCase} createRecurringShowUseCase - Use case for creating recurring shows.
   * @param {ShowJobService} showJobService - Service for scheduling and canceling show-related jobs.
   */
  constructor(
    @inject('CreateShowUseCase') private createShowUseCase: ICreateShowUseCase,
    @inject('UpdateShowUseCase') private updateShowUseCase: IUpdateShowUseCase,
    @inject('UpdateShowStatusUseCase') private updateShowStatusUseCase: IUpdateShowStatusUseCase,
    @inject('DeleteShowUseCase') private deleteShowUseCase: IDeleteShowUseCase,
    @inject('FindShowByIdUseCase') private findShowByIdUseCase: IFindShowByIdUseCase,
    @inject('FindAllShowsUseCase') private findAllShowsUseCase: IFindAllShowsUseCase,
    @inject('FindShowsByVendorUseCase') private findShowsByVendorUseCase: IFindShowsByVendorUseCase,
    @inject('FetchShowSelectionUseCase')
    private fetchShowSelectionUseCase: IFetchShowSelectionUseCase,
    @inject('CreateRecurringShowUseCase')
    private createRecurringShowUseCase: ICreateRecurringShowUseCase,
    @inject('ShowJobService') private showJobService: ShowJobService,
  ) {}

  /**
   * Handles the creation of one or more new shows. Schedules related jobs upon successful creation.
   * @param {Request} req - The Express request object, containing show details in the body. Requires `req.decoded.userId` for the vendor ID.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async createShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = req.decoded?.userId;
      if (!vendorId) {
        throw new CustomError(
          ERROR_MESSAGES.AUTHENTICATION.VENDOR_NOT_FOUND,
          HttpResCode.BAD_REQUEST,
        );
      }
      const shows = await this.createShowUseCase.execute(vendorId, req.body);
      for (const show of shows) {
        try {
          await this.showJobService.scheduleShowJobs(show._id, show.startTime, show.endTime);
        } catch (scheduleError) {
          console.error(
            '❌ ~ ShowManagementController ~ createShow ~ Failed to schedule jobs for show:',
            show._id,
            scheduleError,
          );
        }
      }
      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, shows);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the update of an existing show. Reschedules related jobs upon successful update.
   * @param {Request} req - The Express request object, containing show ID in `req.params.id` and updated show details in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async updateShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      const show = await this.updateShowUseCase.execute({ id, ...req.body });
      try {
        await this.showJobService.scheduleShowJobs(show._id, show.startTime, show.endTime);
      } catch (scheduleError: any) {
        console.error(
          '❌ ~ ShowManagementController ~ updateShow ~ Failed to reschedule jobs for show:',
          show._id,
          scheduleError,
        );
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, show);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates the status of a specific show (e.g., 'active', 'cancelled').
   * @param {Request} req - The Express request object, containing show ID in `req.params.id` and new status in `req.body.status`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async updateShowStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const show = await this.updateShowStatusUseCase.execute(id, status);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, show);
    } catch (error) {
      console.error('❌ ~ ShowManagementController ~ updateShowStatus ~ Error:', error);
      next(error);
    }
  }

  /**
   * Deletes a show by its ID. Cancels related jobs upon successful deletion.
   * @param {Request} req - The Express request object, containing show ID in `req.params.id`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async deleteShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      await this.deleteShowUseCase.execute(id);
      try {
        await this.showJobService.cancelShowJobs(id);
      } catch (cancelError: any) {
        console.error(
          '❌ ~ ShowManagementController ~ deleteShow ~ Failed to cancel jobs for show:',
          id,
          cancelError,
        );
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        message: 'Show deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a single show by its ID.
   * @param {Request} req - The Express request object, containing show ID in `req.params.id`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getShowById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      const show = await this.findShowByIdUseCase.execute(id);
      if (!show) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, show);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches all shows with pagination, search, and filtering options (typically for admin or general listing).
   * @param {Request} req - The Express request object, containing various query parameters for filtering.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getAllShows(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, theaterId, movieId, screenId, status, sortBy, sortOrder } =
        req.query;

      const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        theaterId: theaterId ? (theaterId as string) : undefined,
        movieId: movieId ? (movieId as string) : undefined,
        screenId: screenId ? (screenId as string) : undefined,
        status: status ? (status as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.findAllShowsUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches shows belonging to a specific vendor with pagination and filtering.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` for the vendor ID and optional query parameters for filtering.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getShowsOfVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, sortBy, sortOrder } = req.query;
      const vendorId = req.decoded?.userId;

      if (!vendorId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const params = {
        vendorId,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        status: status ? (status as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.findShowsByVendorUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches show selection options for a given movie, considering user's location and various filters.
   * @param {Request} req - The Express request object. Contains `movieId` in `req.params`, and optional query parameters for `date`, `priceRanges`, `timeSlots`, `facilities`. Also uses `latitude`, `longitude`, and `selectedLocation` from `req.cookies`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getShowSelection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movieId } = req.params;
      const { date, priceRanges, timeSlots, facilities } = req.query;
      let { latitude, longitude, selectedLocation } = req.cookies;

      if (!latitude || !longitude || !selectedLocation) {
        selectedLocation = 'Calicut';
        latitude = 11.5;
        longitude = 76.0;
      }

      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new CustomError('Invalid movie ID', HttpResCode.BAD_REQUEST);
      }

      const params: {
        movieId: string;
        latitude: number;
        longitude: number;
        selectedLocation: string;
        date: string;
        priceRanges?: { min: number; max: number }[];
        timeSlots?: { start: string; end: string }[];
        facilities?: string[];
      } = {
        movieId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        selectedLocation: selectedLocation as string,
        date: date as string,
        priceRanges: priceRanges
          ? (JSON.parse(priceRanges as string) as { id: string; min: number; max: number }[]).map(
              ({ min, max }) => ({ min, max }),
            )
          : undefined,
        timeSlots: timeSlots
          ? (JSON.parse(timeSlots as string) as { id: string; start: string; end: string }[]).map(
              ({ start, end }) => ({ start, end }),
            )
          : undefined,
        facilities: facilities ? (facilities as string).split(',') : undefined,
      };

      const result = await this.fetchShowSelectionUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates recurring shows based on an existing show. Schedules jobs for each newly created show.
   * @param {Request} req - The Express request object, containing `showId`, `startDate`, and `endDate` in the body. Requires `req.decoded.userId` for the vendor ID.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async createRecurringShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { showId, startDate, endDate } = req.body;
      const vendorId = req.decoded?.userId;
      if (!vendorId) {
        throw new CustomError(
          ERROR_MESSAGES.AUTHENTICATION.VENDOR_NOT_FOUND,
          HttpResCode.BAD_REQUEST,
        );
      }

      const shows = await this.createRecurringShowUseCase.execute(
        showId,
        startDate,
        endDate,
        vendorId,
      );

      for (const show of shows) {
        try {
          await this.showJobService.scheduleShowJobs(show._id, show.startTime, show.endTime);
        } catch (scheduleError: any) {
          console.error(
            '❌ ~ ShowManagementController ~ createRecurringShow ~ Failed to schedule jobs for show:',
            show._id,
            scheduleError,
          );
        }
      }

      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, shows);
    } catch (error) {
      next(error);
    }
  }
}
