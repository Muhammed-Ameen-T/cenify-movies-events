import { NextFunction, Request, Response } from 'express';

export interface IMovieMngController {
  createMovie(req: Request, res: Response, next:NextFunction): Promise<void>;
  fetchMovies(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateMovieStatus(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateMovie(req: Request, res: Response, next:NextFunction): Promise<void>;
  findMovieById(req: Request, res: Response, next:NextFunction): Promise<void>;
  fetchMoviesUser(req: Request, res: Response, next:NextFunction): Promise<void>;
  submitRating(req: Request, res: Response, next:NextFunction): Promise<void>;
  likeOrUnlikeMovie(req: Request, res: Response, next:NextFunction): Promise<void>;
  isMovieLiked(req: Request, res: Response, next:NextFunction): Promise<void>;
}
