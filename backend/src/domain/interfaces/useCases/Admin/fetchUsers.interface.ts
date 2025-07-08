// src/domain/interfaces/useCases/Admin/fetchUsers.interface.ts
import { UserResponseDTO } from '../../../../application/dtos/user.dto';

export interface IFetchUsersUseCase {
  execute(params: {
    page: number;
    limit: number;
    isBlocked?: boolean;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    currentPage: any;
    hasPrevPage: any;
    hasNextPage: any;
    totalPages: any;
    users: UserResponseDTO[];
    totalCount: number;
  }>;
}
