// infrastructure/repositories/auth.repository.ts
import { IAuthRepository } from '../../domain/interfaces/repositories/userAuth.types';
import { User } from '../../domain/entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { IUser } from '../../domain/interfaces/model/user.interface';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import { injectable } from 'tsyringe';
@injectable()
export class AuthRepository implements IAuthRepository {
  private userModel: Model<IUser>;

  constructor(userModel: Model<IUser>) {
    this.userModel = userModel;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) return null;
      return new User(
        user._id,
        user.name,
        user.email || '',
        user.phone || null,
        user.authId,
        user.password || null,
        user.profileImage,
        user.dob,
        {
          buyDate: user.moviePass?.buyDate || null,
          expiryDate: user.moviePass?.expiryDate || null,
          isPass: user.moviePass?.isPass || null,
        },
        user.loyalityPoints,
        user.isBlocked,
        user.role,
        user.createdAt,
        user.updatedAt,
      );
    } catch (error) {
      throw new CustomError('Failed to find user by ID.', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) return null;
      return new User(
        user._id,
        user.name,
        user.email || '',
        user.phone || null,
        user.authId,
        user.password || null,
        user.profileImage,
        user.dob,
        {
          buyDate: user.moviePass?.buyDate || null,
          expiryDate: user.moviePass?.expiryDate || null,
          isPass: user.moviePass?.isPass || null,
        },
        user.loyalityPoints,
        user.isBlocked,
        user.role,
        user.createdAt,
        user.updatedAt,
      );
    } catch (error) {
      throw new CustomError('Failed to find user by email.', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
  async findByAuthId(authId: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ authId });
      if (!user) return null;
      return new User(
        user._id,
        user.name,
        user.email || '',
        user.phone || null,
        user.authId,
        user.password || null,
        user.profileImage,
        user.dob,
        {
          buyDate: user.moviePass?.buyDate || null,
          expiryDate: user.moviePass?.expiryDate || null,
          isPass: user.moviePass?.isPass || null,
        },
        user.loyalityPoints,
        user.isBlocked,
        user.role,
        user.createdAt,
        user.updatedAt,
      );
    } catch (error) {
      throw new CustomError('Failed to find user by email.', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async create(user: User | null): Promise<User | null> {
    if (!user) {
      throw new CustomError('User data is null.', HttpResCode.BAD_REQUEST);
    }
    try {
      const newUser = await this.userModel.create({
        _id: user._id,
        name: user.name || 'User',
        email: user.email,
        phone: user.phone || null,
        authId: user.authId,
        password: user.password || null,
        profileImage: user.profileImage,
        dob: user.dob,
        moviePass: user.moviePass,
        loyalityPoints: user.loyalityPoints,
        isBlocked: user.isBlocked,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      return new User(
        newUser._id,
        newUser.name,
        newUser.email || '',
        newUser.phone || null,
        newUser.authId,
        newUser.password || null,
        newUser.profileImage,
        newUser.dob,
        {
          buyDate: user.moviePass?.buyDate || null,
          expiryDate: user.moviePass?.expiryDate || null,
          isPass: user.moviePass?.isPass || null,
        },
        newUser.loyalityPoints,
        newUser.isBlocked,
        newUser.role,
        newUser.createdAt,
        newUser.updatedAt,
      );
    } catch (error) {
      if (error instanceof mongoose.Error && error.message.includes('duplicate key')) {
        throw new CustomError('Email already exists.', HttpResCode.BAD_REQUEST);
      }
      throw new CustomError('Failed to create user.', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async update(user: User): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          user._id,
          {
            name: user.name,
            email: user.email,
            phone: user.phone,
            authId: user.authId,
            profileImage: user.profileImage,
            dob: user.dob,
            moviePass: user.moviePass,
            loyalityPoints: user.loyalityPoints,
            isBlocked: user.isBlocked,
            role: user.role,
            updatedAt: user.updatedAt,
          },
          { new: true },
        )
        .exec();
      if (!updatedUser) {
        throw new CustomError('User not found.', HttpResCode.BAD_REQUEST);
      }
      return new User(
        updatedUser._id,
        updatedUser.name,
        updatedUser.email || '',
        updatedUser.phone || null,
        updatedUser.authId,
        updatedUser.password || null,
        updatedUser.profileImage,
        updatedUser.dob,
        {
          buyDate: user.moviePass?.buyDate || null,
          expiryDate: user.moviePass?.expiryDate || null,
          isPass: user.moviePass?.isPass || null,
        },
        updatedUser.loyalityPoints,
        updatedUser.isBlocked,
        updatedUser.role,
        updatedUser.createdAt,
        updatedUser.updatedAt,
      );
    } catch (error) {
      throw new CustomError('Failed to update user.', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
