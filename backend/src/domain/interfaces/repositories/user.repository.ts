// src/domain/interfaces/repositories/user.repository.ts
import { User } from '../../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByAuthId(authId: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  updateMoviePass(userId: string, moviePass: any): Promise<User>;
  updatePassword(email: string, password: string): Promise<User>;
  findUsers(params: {
    page: number;
    limit: number;
    isBlocked?: boolean;
    role?: string[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    hasPrevPage: boolean;
    hasNextPage: boolean;
    currentPage: number;
    totalPages: number;
    users: User[];
    totalCount: number;
  }>;
  updateBlockStatus(id: string, isBlocked: boolean): Promise<void>;
  updatePasswordById(userId: string, password: string): Promise<User>;
  incrementLoyalityPoints(userId: string, seatCount: number): Promise<User>;
  findByPhone(phone:number): Promise<User | null>;
}
