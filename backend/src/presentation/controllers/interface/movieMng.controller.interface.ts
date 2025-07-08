import { Request, Response } from 'express';

export interface IMovieMngController {
  createMovie(req: Request, res: Response): Promise<void>;
  fetchMovies(req: Request, res: Response): Promise<void>;
  updateMovieStatus(req: Request, res: Response): Promise<void>;
  updateMovie(req: Request, res: Response): Promise<void>;
  findMovieById(req: Request, res: Response): Promise<void>;
  fetchMoviesUser(req: Request, res: Response): Promise<void>;
  submitRating(req: Request, res: Response): Promise<void>;
  likeOrUnlikeMovie(req: Request, res: Response): Promise<void>;
  isMovieLiked(req: Request, res: Response): Promise<void>;
}
