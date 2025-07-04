import { ObjectId } from 'mongoose';
import { Min, IsEnum } from 'class-validator';

export class CreateMovieDTO {
  constructor(
    public name: string,
    public genre: string[],
    public trailer: string,
    public rating: number,
    public poster: string,
    public duration: { hours: number; minutes: number; seconds: number },
    public description: string,
    public language: string,
    public releaseDate: string,
    public is3D: boolean,
    public crew: { id?: string; name: string; role: string; profileImage?: string }[],
    public cast: { id?: string; name: string; as: string; profileImage?: string }[],
  ) {}
}

export class UpdateMovieStatusDTO {
  constructor(
    public id: string,
    public status: string,
  ) {}
}

export class UpdateMovieDTO {
  constructor(
    public id: string,
    public name: string,
    public genre: string[],
    public trailer: string,
    public rating: number,
    public poster: string,
    public duration: { hours: number; minutes: number; seconds: number },
    public description: string,
    public language: string,
    public releaseDate: string,
    public is3D: boolean,
    public crew: { id?: string; name: string; role: string; profileImage?: string }[],
    public cast: { id?: string; name: string; as: string; profileImage?: string }[],
  ) {}
}

export class SubmitRatingDTO {
  constructor(
    public userId: string,
    public movieId: string,
    public theaterId: string,
    public theaterRating: number,
    public movieRating: number,
    public movieReview: string,
  ) {}
}

import { IsOptional, IsString, IsNumber, IsIn, IsArray } from 'class-validator';

export class FetchMoviesDTO {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['upcoming', 'released', 'archived'], { each: true })
  status?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genre?: string[];

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class FetchMoviesUserDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genre?: string[];

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsNumber()
  latitude?: number;

  @IsNumber()
  longitude?: number;

  @IsString()
  selectedLocation?: string;
}
