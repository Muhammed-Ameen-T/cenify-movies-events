// src/useCases/Admin/fetchUsers.useCase.ts
import { injectable, inject } from 'tsyringe';
import { IFetchUsersUseCase } from '../../../domain/interfaces/useCases/Admin/fetchUsers.interface';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { UserResponseDTO } from '../../../application/dtos/user.dto';
import { User } from '../../../domain/entities/user.entity';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FetchUsersUseCase implements IFetchUsersUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(params: {
    page: number;
    limit: number;
    isBlocked?: boolean;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    users: UserResponseDTO[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const { page, limit, isBlocked, role, search, sortBy, sortOrder } = params;
      const roleArray = role ? role.split(',') : undefined;

      const result = await this.userRepository.findUsers({
        page,
        limit,
        isBlocked,
        role: roleArray,
        search,
        sortBy,
        sortOrder,
      });

      return {
        users: result.users.map((user) => this.mapToDTO(user)),
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      };
    } catch (error) {
      console.error('FetchUsersUseCase error:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FETCHING_USERS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapToDTO(user: User): UserResponseDTO {
    return new UserResponseDTO(
      user._id.toString(),
      user.name,
      user.email,
      user.phone,
      user.role as 'user' | 'admin' | 'vendor',
      user.isBlocked,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
      user.profileImage,
    );
  }
}
