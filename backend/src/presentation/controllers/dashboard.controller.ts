// src/interfaces/controllers/dashboard.controller.ts
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { IDashboardController } from './interface/dashboard.controller.interface';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { DashboardQueryParams } from '../../domain/interfaces/model/vendorDashboard.interface';
import { IFetchDashboardUseCase } from '../../domain/interfaces/useCases/Vendor/fetchDashboard.interface';
import { AdminDashboardQueryParams } from '../../domain/interfaces/model/adminDashboard.interface';
import { IFetchAdminDashboardUseCase } from '../../domain/interfaces/useCases/Admin/adminDashboard.interface';

@injectable()
export class DashboardController implements IDashboardController {
  constructor(
    @inject('FetchDashboardUseCase') private fetchDashboardUseCase: IFetchDashboardUseCase,
    @inject('FetchAdminDashboardUseCase')
    private fetchAdminDashboardUseCase: IFetchAdminDashboardUseCase,
  ) {}

  async getDashboardData(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const vendorId = req.decoded?.userId;
      if (!vendorId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const params: DashboardQueryParams = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as string,
        location: req.query.location as string,
      };

      const result = await this.fetchDashboardUseCase.execute(vendorId, params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error)
    }
  }

  async getAdminDashboardData(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const adminId = req.decoded?.userId;
      if (!adminId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const params: AdminDashboardQueryParams = {
        period: req.query.period as 'daily' | 'monthly' | 'annually',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        location: req.query.location as string,
      };

      const result = await this.fetchAdminDashboardUseCase.execute(adminId, params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error)
    }
  }
}
