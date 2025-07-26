import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
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
  FetchMoviesUserDTO,
  SubmitRatingDTO,
} from '../../application/dtos/movie.dto';
import { IMovieMngController } from './interface/movieMng.controller.interface';
import { ICreateMovieUseCase } from '../../domain/interfaces/useCases/Admin/createMovie.interface';
import { IFetchMoviesUseCase } from '../../domain/interfaces/useCases/Admin/fetchMovies.interface';
import { IUpdateMovieStatusUseCase } from '../../domain/interfaces/useCases/Admin/updateMovieStatus.interface';
import { IUpdateMovieUseCase } from '../../domain/interfaces/useCases/Admin/updateMovie.interface';
import { IFindMovieByIdUseCase } from '../../domain/interfaces/useCases/Admin/findMovieById.interface';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
import mongoose from 'mongoose';
import { IFetchMoviesUserUseCase } from '../../domain/interfaces/useCases/User/fetchMovieUser.interface';
import { IRateMovieUseCase } from '../../domain/interfaces/useCases/User/rateMovie.interface';
import { IIsMovieLikedUseCase } from '../../domain/interfaces/useCases/User/isMovieLiked.interface';
import { ILikeOrUnlikeMovieUseCase } from '../../domain/interfaces/useCases/User/likeOrUnlikeMovie.interface';

/**
 * Controller for managing movie-related operations, accessible by both admins and users.
 * @implements {IMovieMngController}
 */
@injectable()
export class MovieMngController implements IMovieMngController {
  /**
   * Constructs an instance of MovieMngController.
   * @param {ICreateMovieUseCase} createMovieUseCase - Use case for creating a new movie.
   * @param {IFetchMoviesUseCase} fetchMoviesUseCase - Use case for fetching movies (admin view).
   * @param {IUpdateMovieStatusUseCase} updateMovieStatusUseCase - Use case for updating a movie's status.
   * @param {IUpdateMovieUseCase} updateMovieUseCase - Use case for updating movie details.
   * @param {IFindMovieByIdUseCase} findMovieByIdUseCase - Use case for finding a movie by ID.
   * @param {IFetchMoviesUserUseCase} fetchMoviesUserUseCase - Use case for fetching movies (user view).
   * @param {IRateMovieUseCase} rateMovieUseCase - Use case for submitting movie and theater ratings.
   * @param {IIsMovieLikedUseCase} isMovieLikedUseCase - Use case for checking if a movie is liked by a user.
   * @param {ILikeOrUnlikeMovieUseCase} likeOrUnlikeMovieUseCase - Use case for liking or unliking a movie.
   */
  constructor(
    @inject('CreateMovieUseCase') private createMovieUseCase: ICreateMovieUseCase,
    @inject('FetchMoviesUseCase') private fetchMoviesUseCase: IFetchMoviesUseCase,
    @inject('UpdateMovieStatusUseCase') private updateMovieStatusUseCase: IUpdateMovieStatusUseCase,
    @inject('UpdateMovieUseCase') private updateMovieUseCase: IUpdateMovieUseCase,
    @inject('FindMovieByIdUseCase') private findMovieByIdUseCase: IFindMovieByIdUseCase,
    @inject('FetchMoviesUserUseCase') private fetchMoviesUserUseCase: IFetchMoviesUserUseCase,
    @inject('RateMovieUseCase') private rateMovieUseCase: IRateMovieUseCase,
    @inject('IsMovieLikedUseCase') private isMovieLikedUseCase: IIsMovieLikedUseCase,
    @inject('LikeOrUnlikeMovieUseCase') private likeOrUnlikeMovieUseCase: ILikeOrUnlikeMovieUseCase,
  ) {}

  /**
   * Handles the creation of a new movie by an admin.
   * @param {Request} req - The Express request object, containing movie details in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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
        cast,
      );
      const movie = await this.createMovieUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, SuccessMsg.MOVIE_ADDED, movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches a list of movies with pagination, search, and filtering options for admin view.
   * @param {Request} req - The Express request object, containing query parameters for filtering.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async fetchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Updates the status of a movie.
   * @param {Request} req - The Express request object, containing movie ID and new status in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async updateMovieStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  /**
   * Updates the details of an existing movie.
   * @param {Request} req - The Express request object, containing updated movie details in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async updateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        cast,
      );
      const movie = await this.updateMovieUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, SuccessMsg.MOVIE_UPDATED, movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finds a movie by its ID.
   * @param {Request} req - The Express request object, containing the movie ID in `req.params.id`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid or missing movie ID', HttpResCode.BAD_REQUEST);
      }

      const movie = await this.findMovieByIdUseCase.execute(id);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches a list of movies with pagination, search, filtering, and location-based relevance for user view.
   * Uses latitude and longitude from cookies for location awareness, defaulting to "Calicut" if not present.
   * @param {Request} req - The Express request object, containing query parameters and potentially cookies for location.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async fetchMoviesUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, genre, sortBy, sortOrder } = req.query;
      let { latitude, longitude, selectedLocation } = req.cookies;

      if (!latitude || !longitude || !selectedLocation) {
        selectedLocation = 'Calicut';
        latitude = 11.5;
        longitude = 76.0;
      }

      const params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string[];
        genre?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        latitude: number;
        longitude: number;
        selectedLocation: string;
      } = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        genre: genre ? (genre as string).split(',') : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        selectedLocation: selectedLocation as string,
      };

      // Validate DTO
      const dto = new FetchMoviesUserDTO();
      Object.assign(dto, params);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new CustomError('Invalid query or location parameters', HttpResCode.BAD_REQUEST);
      }

      const result = await this.fetchMoviesUserUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submits a rating for a movie and a theater by a user.
   * @param {Request} req - The Express request object, containing `movieId`, `theaterId`, `movieRating`, `theaterRating`, and `review` in the body. User ID is from `req.decoded.userId`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async submitRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movieId, theaterId, movieRating, theaterRating, review } = req.body;

      const userId = req.decoded?.userId;

      if (!movieId || !theaterId || !userId) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      const dto = new SubmitRatingDTO(
        userId,
        movieId,
        theaterId,
        theaterRating,
        movieRating,
        review,
      );

      const result = await this.rateMovieUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'Rating submitted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles liking or unliking a movie by a user.
   * @param {Request} req - The Express request object, containing `movieId` and `isLike` (boolean) in the body. User ID is from `req.decoded.userId`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async likeOrUnlikeMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      const { movieId, isLike } = req.body;

      const response = await this.likeOrUnlikeMovieUseCase.execute(movieId, userId, isLike);

      sendResponse(res, HttpResCode.OK, SuccessMsg.LIKE_UPDATED, response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Checks if a user has liked a specific movie.
   * @param {Request} req - The Express request object, containing `movieId` in `req.params.id`. User ID is from `req.decoded.userId`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async isMovieLiked(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      const { movieId } = req.params;
      const response = await this.isMovieLikedUseCase.execute(movieId, userId);
      sendResponse(res, HttpResCode.OK, SuccessMsg.LIKE_FETCHED, response);
    } catch (error) {
      next(error);
    }
  }
}
