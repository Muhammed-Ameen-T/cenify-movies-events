import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { validate } from 'class-validator';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';
import {
  CreateMovieDTO,
  UpdateMovieStatusDTO,
  UpdateMovieDTO,
  FetchMoviesDTO,
} from '../../application/dtos/movie.dto';
import { IMovieMngController } from './interface/movieMng.controller.interface';
import { ICreateMovieUseCase } from '../../domain/interfaces/useCases/Admin/createMovie.interface';
import { IFetchMoviesUseCase } from '../../domain/interfaces/useCases/Admin/fetchMovies.interface';
import { IUpdateMovieStatusUseCase } from '../../domain/interfaces/useCases/Admin/updateMovieStatus.interface';
import { IUpdateMovieUseCase } from '../../domain/interfaces/useCases/Admin/updateMovie.interface';
import { IFindMovieByIdUseCase } from '../../domain/interfaces/useCases/Admin/findMovieById.interface';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
import mongoose from 'mongoose';

@injectable()
export class MovieMngController implements IMovieMngController {
  constructor(
    @inject('CreateMovieUseCase') private createMovieUseCase: ICreateMovieUseCase,
    @inject('FetchMoviesUseCase') private fetchMoviesUseCase: IFetchMoviesUseCase,
    @inject('UpdateMovieStatusUseCase') private updateMovieStatusUseCase: IUpdateMovieStatusUseCase,
    @inject('UpdateMovieUseCase') private updateMovieUseCase: IUpdateMovieUseCase,
    @inject('FindMovieByIdUseCase') private findMovieByIdUseCase: IFindMovieByIdUseCase
  ) {}

  async createMovie(req: Request, res: Response): Promise<void> {
    try {
      console.log("🚀 ~ MovieMngController ~ createMovie ~ req.body:", req.body);
      const {
        name,
        genre,
        trailerLink,
        poster,
        duration,
        description,
        language,
        releaseDate,
        is3D,
        crew,
        cast,
      } = req.body;
      const dto = new CreateMovieDTO(
        name,
        genre,
        trailerLink,
        0,
        poster,
        duration,
        description,
        language,
        releaseDate,
        is3D,
        crew,
        cast
      );
      console.log("🚀 ~ MovieMngController ~ createMovie ~ dto:", dto);
      const movie = await this.createMovieUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, SuccessMsg.MOVIE_ADDED, movie);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async fetchMovies(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, status, genre, sortBy, sortOrder } = req.query;

      // Convert query parameters
      const params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string[];
        genre?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        genre: genre ? (genre as string).split(',') : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      // Validate DTO
      const dto = new FetchMoviesDTO();
      Object.assign(dto, params);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new CustomError('Invalid query parameters', HttpResCode.BAD_REQUEST);
      }

      const result = await this.fetchMoviesUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND;
      sendResponse(res, HttpResCode.NOT_FOUND, errorMessage);
    }
  }

  async updateMovieStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id, status } = req.body;
      const dto = new UpdateMovieStatusDTO(id, status);
      const movie = await this.updateMovieStatusUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, SuccessMsg.MOVIE_STATUS_UPDATED, movie);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async updateMovie(req: Request, res: Response): Promise<void> {
    try {
      const {
        id,
        name,
        genre,
        trailer,
        rating,
        poster,
        duration,
        description,
        language,
        releaseDate,
        is3D,
        crew,
        cast,
      } = req.body;
      const dto = new UpdateMovieDTO(
        id,
        name,
        genre,
        trailer,
        rating,
        poster,
        duration,
        description,
        language,
        releaseDate,
        is3D,
        crew,
        cast
      );
      const movie = await this.updateMovieUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, SuccessMsg.MOVIE_UPDATED, movie);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async findMovieById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid or missing movie ID', HttpResCode.BAD_REQUEST);
      }

      const movie = await this.findMovieByIdUseCase.execute(id);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, movie);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND;
      const statusCode = error instanceof CustomError ? error.statusCode : HttpResCode.NOT_FOUND;
      sendResponse(res, statusCode, errorMessage);
    }
  }
}