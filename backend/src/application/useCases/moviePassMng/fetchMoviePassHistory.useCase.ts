import { inject, injectable } from 'tsyringe';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import { MoviePassHistory } from '../../../domain/entities/moviePass.entity';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { IFindMoviePassHistoryUseCase } from '../../../domain/interfaces/useCases/User/findUserMoviePassHistory.interface';

@injectable()
export class FindMoviePassHistoryUseCase implements IFindMoviePassHistoryUseCase {
  constructor(@inject('MoviePassRepository') private moviePassRepository: IMoviePassRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    history: MoviePassHistory[];
    total: number;
  }> {
    try {
      const result = await this.moviePassRepository.findHistoryByUserId(userId, page, limit);
      return result;
    } catch (error) {
      console.error('❌ Error in FindMoviePassHistoryUseCase:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FINDING_MOVIE_PASS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
