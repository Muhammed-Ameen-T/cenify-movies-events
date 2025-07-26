import { inject, injectable } from 'tsyringe';
import { MoviePass } from '../../../domain/entities/moviePass.entity';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import { CreateMoviePassDTO } from '../../dtos/moviePass.dto';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { INotificationRepository } from '../../../domain/interfaces/repositories/notification.repository';
import { Notification } from '../../../domain/entities/notification.entity';
import { MoviePassJobService } from '../../../infrastructure/services/moviePass.service';
import { ICreateMoviePassUseCase } from '../../../domain/interfaces/useCases/User/moviePass.interface';
import { socketService } from '../../../infrastructure/services/socket.service';

@injectable()
export class CreateMoviePassUseCase implements ICreateMoviePassUseCase {
  constructor(
    @inject('MoviePassRepository') private moviePassRepository: IMoviePassRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('NotificationRepository') private notificationRepository: INotificationRepository,
    @inject('MoviePassJobService') private moviePassJobService: MoviePassJobService,
  ) {}

  async execute(dto: CreateMoviePassDTO): Promise<MoviePass> {
    console.log('🚀 ~ CreateMoviePassUseCase ~ execute ~ dto:', dto);
    // Check if user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new CustomError('User not found', HttpResCode.BAD_REQUEST);
    }

    // Check if Movie Pass exists
    let moviePass = await this.moviePassRepository.findByUserId(dto.userId);
    if (moviePass) {
      // Update existing Movie Pass
      const updateMoviePass = new MoviePass(
        moviePass?._id,
        dto.userId,
        'Active',
        moviePass.history,
        dto.purchaseDate,
        dto.expireDate,
        moviePass.moneySaved,
        moviePass.totalMovies,
      );
      moviePass = await this.moviePassRepository.update(moviePass._id!, updateMoviePass);
      console.log('🚀 ~ CreateMoviePassUseCase ~ execute ~ moviePass:', moviePass);
      if (!moviePass) {
        throw new CustomError('Failed to update Movie Pass', HttpResCode.INTERNAL_SERVER_ERROR);
      }
    } else {
      // Create new Movie Pass
      const newMoviePass = new MoviePass(
        null,
        dto.userId,
        'Active',
        [],
        dto.purchaseDate,
        dto.expireDate,
        0,
        0,
      );
      moviePass = await this.moviePassRepository.create(newMoviePass);
    }

    // Update user document
    await this.userRepository.updateMoviePass(dto.userId, {
      moviePass: {
        buyDate: dto.purchaseDate,
        expiryDate: dto.expireDate,
        isPass: true,
      },
    });

    // Send notification
    const notification = new Notification(
      null as any,
      dto.userId,
      'Movie Pass Purchased',
      'MoviePass',
      'Your Movie Pass has been successfully activated!',
      null,
      new Date(),
      new Date(),
      false,
      false,
      [],
    );
    await this.notificationRepository.createNotification(notification);
    socketService.emitNotification(`user-${dto.userId}`, notification);

    // Schedule expiration job
    await this.moviePassJobService.scheduleMoviePassExpiration(dto.userId, dto.expireDate);

    return moviePass;
  }
}
