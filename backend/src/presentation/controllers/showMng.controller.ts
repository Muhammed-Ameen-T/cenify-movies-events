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

@injectable()
export class ShowManagementController implements IShowManagementController {
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

  async createShow(req: Request, res: Response, next:NextFunction): Promise<void> {
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
     next(error)
    }
  }

  async updateShow(req: Request, res: Response, next:NextFunction): Promise<void> {
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
      next(error)
    }
  }

  async updateShowStatus(req: Request, res: Response, next:NextFunction): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const show = await this.updateShowStatusUseCase.execute(id, status);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, show);
    } catch (error) {
      console.error('❌ ~ ShowManagementController ~ updateShowStatus ~ Error:', error);
next(error)    }
  }

  async deleteShow(req: Request, res: Response, next:NextFunction): Promise<void> {
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
   next(error)
    }
  }

  async getShowById(req: Request, res: Response, next:NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      const show = await this.findShowByIdUseCase.execute(id);
      if (!show) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, show);
    } catch (error) {
   next(error)
    }
  }

  async getAllShows(req: Request, res: Response, next:NextFunction): Promise<void> {
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
next(error)
    }
  }

  async getShowsOfVendor(req: Request, res: Response, next:NextFunction): Promise<void> {
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
 next(error)
    }
  }

  async getShowSelection(req: Request, res: Response, next:NextFunction): Promise<void> {
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
   next(error)
    }
  }

  async createRecurringShow(req: Request, res: Response, next:NextFunction): Promise<void> {
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
   next(error)
    }
  }
}
