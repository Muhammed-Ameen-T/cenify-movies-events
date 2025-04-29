import { User } from '../../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByAuthId(authId: string): Promise<User | null>;
  findById(authId: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
