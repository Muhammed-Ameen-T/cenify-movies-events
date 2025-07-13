import { User } from '../../../entities/user.entity';

export interface IgetUserDetailsUseCase {
  execute(id: string): Promise<User>;
}
