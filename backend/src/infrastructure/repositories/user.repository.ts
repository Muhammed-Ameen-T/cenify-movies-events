// src/infrastructure/repositories/user.repository.ts
import { injectable } from 'tsyringe';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { UserModel } from '../database/user.model';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

@injectable()
export class UserRepositoryImpl implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.toEntity(user) : null;
  }

  async findByAuthId(authId: string): Promise<User | null> {
    const user = await UserModel.findOne({ authId });
    return user ? this.toEntity(user) : null;
  }

  async create(user: User): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return this.toEntity(savedUser);
  }

  async update(user: User): Promise<User> {
    await UserModel.updateOne({ _id: user._id }, user);
    const updatedUser = await UserModel.findById(user._id);
    if (!updatedUser) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
    return this.toEntity(updatedUser);
  }

  async updatePassword(email: string, password: string): Promise<User> {
    await UserModel.updateOne({ email }, { password });
    const updatedUser = await UserModel.findOne({ email });
    if (!updatedUser) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
    return this.toEntity(updatedUser);
  }

  async findUsers(params: {
    page: number;
    limit: number;
    isBlocked?: boolean;
    role?: string[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    users: User[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const { page, limit, isBlocked, role, search, sortBy, sortOrder } = params;
      const query: any = {};

      if (isBlocked !== undefined) {
        query.isBlocked = isBlocked;
      }
      if (role && role.length > 0) {
        query.role = { $in: role };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const sort: any = {};
      if (sortBy) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      const totalCount = await UserModel.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      const users = await UserModel.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        users: users.map((user) => this.toEntity(user)),
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FETCHING_USERS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { isBlocked, updatedAt: new Date() },
        { new: true },
      );
      if (!user) {
        throw new CustomError(
          ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
          HttpResCode.NOT_FOUND,
        );
      }
    } catch (error) {
      throw error instanceof CustomError
        ? error
        : new CustomError(
            ERROR_MESSAGES.GENERAL.FAILED_UPDATING_BLOCK_STATUS,
            HttpResCode.INTERNAL_SERVER_ERROR,
          );
    }
  }

  private toEntity(doc: any): User {
    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.phone,
      doc.authId,
      doc.password,
      doc.profileImage,
      doc.dob,
      doc.moviePass,
      doc.loyalityPoints,
      doc.isBlocked,
      doc.role,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}