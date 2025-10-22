// src/infrastructure/repositories/user.repository.ts
import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';   
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { UserModel } from '../database/user.model';
import { IUser } from '../../domain/interfaces/model/user.interface';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { Document, Types } from 'mongoose';
import { MoviePass } from '../../domain/entities/moviePass.entity';

// Define the Mongoose Document Type for User
type UserDocument = IUser & Document;

/**
 * Repository implementation for User entity, extending the generic BaseRepository
 * for common CRUD operations and adding specific methods like findByEmail.
 * @implements {IUserRepository}
 * @extends {BaseRepository<UserDocument>}
 */
@injectable()
export class UserRepositoryImpl
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  // --- Custom FIND Methods ---

  /**
   * Finds a user by email (case-insensitive).
   * @param email The user's email address.
   * @returns A Promise that resolves to the User entity or null.
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.model.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') },
    });
    return user ? this.toEntity(user) : null;
  }

  /**
   * Finds a user by their database ID. Implements the IUserRepository signature.
   * Uses the inherited 'model' property which handles string IDs.
   * @param id The user's database ID (as a string).
   * @returns A Promise that resolves to the User entity or null.
   */
  async findById(id: string): Promise<User | null> {
    // FIX: Using this.model.findById(id) directly satisfies the IUserRepository string ID without
    // causing a signature conflict with BaseRepository's ObjectId method.
    const user = await this.model.findById(id);
    // @ts-ignore
    return user ? this.toEntity(user) : null;
  }

  /**
   * Finds a user by their external authentication ID (e.g., from OAuth).
   * @param authId The user's external authentication ID.
   * @returns A Promise that resolves to the User entity or null.
   */
  async findByAuthId(authId: string): Promise<User | null> {
    const user = await this.model.findOne({ authId });
    // @ts-ignore
    return user ? this.toEntity(user) : null;
  }

  /**
   * Finds a user by phone number.
   * @param phone The user's phone number.
   * @returns A Promise that resolves to the User entity or null.
   */
  async findByPhone(phone: number): Promise<User | null> {
    const user = await this.model.findOne({ phone });
    // @ts-ignore
    return user ? this.toEntity(user) : null;
  }

  // --- Custom CREATE/UPDATE Methods ---

  /**
   * Creates a new user in the database.
   * FIX: Calls the renamed base method: createDoc.
   * @param user The User entity to create.
   * @returns A Promise that resolves to the created User entity.
   */
  async create(user: User): Promise<User> {
    console.log('📝 Creating user:', user);
    user.email = user.email.toLowerCase(); // Ensure email is stored in lowercase
    
    // Call the renamed document creation method
    const savedUserDoc = await super.createDoc({
      ...user,
      _id: undefined, // ensure Mongoose generates a new ID
    } as Partial<UserDocument>);

    console.log('✅ User created successfully:', savedUserDoc);
    // @ts-ignore
    return this.toEntity(savedUserDoc);
  }

  /**
   * Updates an existing user's details.
   * FIX: Calls the renamed base method: updateDoc.
   * @param user The User entity with updated information.
   * @returns A Promise that resolves to the updated User entity.
   */
  async update(user: User): Promise<User> {
    if (!user._id) {
      throw new CustomError(
        'User ID is required for update.',
        HttpResCode.BAD_REQUEST,
      );
    }
    console.log('🔄 Updating user:', user);

    // Call the renamed document update method
    const updatedUserDoc = await super.updateDoc(
      new Types.ObjectId(user._id.toString()),
      user as Partial<UserDocument>,
    );

    if (!updatedUserDoc) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.NOT_FOUND,
      );
    }
    // @ts-ignore
    return this.toEntity(updatedUserDoc);
  }

  /**
   * Updates the movie pass details for a user.
   * @param userId The ID of the user.
   * @param moviePass The new movie pass object.
   * @returns A Promise that resolves to the updated User entity.
   */
  async updateMoviePass(userId: string, moviePass: MoviePass): Promise<User> {
    console.log('🔄 Updating movie pass for user:', userId);

    const updateResult = await super.updateOne(
      { _id: userId },
      { $set: { moviePass } },
    );

    if (updateResult.modifiedCount === 0) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.NOT_FOUND,
      );
    }

    const updatedUser = await this.model.findById(userId);
    if (!updatedUser) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.NOT_FOUND,
      );
    }
    // @ts-ignore
    return this.toEntity(updatedUser);
  }

  /**
   * Updates a user's password based on their email.
   * @param email The user's email.
   * @param password The new hashed password.
   * @returns A Promise that resolves to the updated User entity.
   */
  async updatePassword(email: string, password: string): Promise<User> {
    console.log('🔄 Updating password for email:', email);
    await super.updateOne({ email }, { password });

    const updatedUser = await this.model.findOne({ email });
    if (!updatedUser) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.NOT_FOUND,
      );
    }
    // @ts-ignore
    return this.toEntity(updatedUser);
  }

  /**
   * Updates a user's password based on their ID.
   * @param userId The user's ID.
   * @param password The new hashed password.
   * @returns A Promise that resolves to the updated User entity.
   */
  async updatePasswordById(userId: string, password: string): Promise<User> {
    console.log('🔄 Updating password for userId:', userId);
    await super.updateOne(
      { _id: userId },
      { password, updatedAt: new Date() },
    );
    const updatedUser = await this.model.findById(userId);
    if (!updatedUser) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.NOT_FOUND,
      );
    }
    // @ts-ignore
    return this.toEntity(updatedUser);
  }

  /**
   * Updates the block status of a user.
   * @param id The ID of the user to block/unblock.
   * @param isBlocked The new block status.
   * @returns A Promise that resolves when the update is complete.
   */
  async updateBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    try {
      console.log('🚫 Updating block status for ID:', id);
      const user = await this.model.findByIdAndUpdate(
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
      console.log('✅ Block status updated:', user);
    } catch (error) {
      throw error instanceof CustomError
        ? error
        : new CustomError(
            ERROR_MESSAGES.GENERAL.FAILED_UPDATING_BLOCK_STATUS,
            HttpResCode.INTERNAL_SERVER_ERROR,
          );
    }
  }

  /**
   * Increments the user's loyalty points.
   * @param userId The ID of the user.
   * @param seatCount The number of seats booked (to calculate points).
   * @returns A Promise that resolves to the updated User entity.
   */
  async incrementLoyalityPoints(userId: string, seatCount: number): Promise<User> {
    try {
      const pointsToAdd = seatCount * 5;

      const updatedUser = await this.model.findByIdAndUpdate(
        userId,
        { $inc: { loyalityPoints: pointsToAdd } },
        { new: true },
      );

      if (!updatedUser) {
        throw new CustomError(
          ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
          HttpResCode.NOT_FOUND,
        );
      }

      // @ts-ignore
      return this.toEntity(updatedUser);
    } catch (error) {
      console.error('❌ Error incrementing loyalty points:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_UPDATED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetches users with pagination, filtering, searching, and sorting capabilities.
   * @param params Query parameters.
   * @returns A Promise that resolves to the paginated list of User entities and metadata.
   */
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

      query.role = { $ne: 'admin' };

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
      } else {
        sort.createdAt = -1;
      }

      const totalCount = await this.model.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      const users = await this.model
        .find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // @ts-ignore: The lean() result is an IUser object, which is mappable to the Entity
      return {
        users: users.map((user) => this.toEntity(user as UserDocument)),
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

  // --- Utility Method ---

  /**
   * Converts a Mongoose Document (or lean object) to the Domain Entity.
   * @param doc The Mongoose Document (or a lean object).
   * @returns The User Domain Entity.
   * @private
   */
  private toEntity(doc: UserDocument | (IUser & { _id: Types.ObjectId })): User {
    // Safely get a plain JavaScript object from the Mongoose Document or use the lean object
    const userDoc = (doc as UserDocument).toObject ? (doc as UserDocument).toObject() : doc;

    if (!userDoc) {
      throw new Error('❌ Invalid user document: Cannot convert null to entity');
    }

    const id = userDoc._id.toString();

    return new User(
      id,
      userDoc.name,
      userDoc.email,
      userDoc.phone,
      userDoc.authId,
      userDoc.password,
      userDoc.profileImage,
      userDoc.dob,
      userDoc.moviePass,
      userDoc.loyalityPoints,
      userDoc.isBlocked,
      userDoc.role,
      userDoc.createdAt,
      userDoc.updatedAt,
    );
  }
}