import { Show } from '../../../entities/show.entity';

export interface IFindAllShowsUseCase {
  execute(params: {
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    movieId?: string;
    screenId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shows: Show[]; totalCount: number }>;
}
