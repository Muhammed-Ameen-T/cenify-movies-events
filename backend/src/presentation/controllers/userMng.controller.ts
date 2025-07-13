// src/infrastructure/controllers/userMng.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { IFetchUsersUseCase } from '../../domain/interfaces/useCases/Admin/fetchUsers.interface';
import { IUpdateUserBlockStatusUseCase } from '../../domain/interfaces/useCases/Admin/updateUserBlockStatus.interface';
import { IUserManagementController } from '../controllers/interface/userMng.controller.interface';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

@injectable()
export class UserManagementController implements IUserManagementController {
  constructor(
    @inject('FetchUsersUseCase') private fetchUsersUseCase: IFetchUsersUseCase,
    @inject('UpdateUserBlockStatusUseCase')
    private updateUserBlockStatusUseCase: IUpdateUserBlockStatusUseCase,
  ) {}

  async getUsers(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        limit = '5',
        isBlocked,
        role,
        search,
        sortBy,
        sortOrder,
      } = req.query as {
        page?: string;
        limit?: string;
        isBlocked?: string;
        role?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      };

      const isBlockedBool = isBlocked !== undefined ? isBlocked === 'true' : undefined;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || isNaN(limitNum)) {
        throw new CustomError('Invalid pagination parameters', HttpResCode.BAD_REQUEST);
      }

      const result = await this.fetchUsersUseCase.execute({
        page: pageNum,
        limit: limitNum,
        isBlocked: isBlockedBool,
        role,
        search,
        sortBy,
        sortOrder,
      });

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        data: {
          data: result.users,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      });
    } catch (error) {
      next(error)
    }
  }

  async updateUserBlockStatus(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;

      if (id === undefined || isBlocked === undefined) {
        throw new CustomError('Missing required fields', HttpResCode.BAD_REQUEST);
      }

      await this.updateUserBlockStatusUseCase.execute(id, { isBlocked }, res);
    } catch (error) {
      next(error)
    }
  }
}
