import { inject, injectable } from 'tsyringe';
import { IgetUserDetailsUseCase } from '../../../domain/interfaces/useCases/User/getUserDetails.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@injectable()
export class getUserDetailsUseCase implements IgetUserDetailsUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
