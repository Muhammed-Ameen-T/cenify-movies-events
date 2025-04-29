import { ObjectId } from 'mongoose';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { UserModel } from '../database/user.model';
import { BaseRepository } from './base.repository';

export class UserRepositoryImpl implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email });
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findOne({ id: id });
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
    return this.toEntity(updatedUser!);
  }

  private toEntity(doc: any): User {
    return new User(
      doc._id,
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
      doc.isAdmin,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
