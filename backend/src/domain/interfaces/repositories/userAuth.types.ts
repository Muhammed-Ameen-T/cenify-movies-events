import { User } from '../../entities/user.entity';

export interface IAuthRepository {
  create(user: null): User | Promise<User | null> | null;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByAuthId(email: string): Promise<User | null>;
}
