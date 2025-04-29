import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custome.error';
import { IFetchTheatersUseCase } from '../../domain/interfaces/useCases/Vendor/fetchTheaters.interface';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { ITheaterManagementController } from './interface/theaterMng.controller.interface';
import { IUpdateTheaterStatusUseCase } from '../../domain/interfaces/useCases/Vendor/updateTheaterStatus.interface';

@injectable()
export class TheaterManagementController implements ITheaterManagementController {
  constructor(
    @inject('FetchTheatersUseCase') private fetchTheatersUseCase: IFetchTheatersUseCase,
    @inject('UpdateTheaterStatus') private updateTheaterStatusUseCase: IUpdateTheaterStatusUseCase,
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
}