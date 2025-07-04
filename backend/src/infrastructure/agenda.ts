import { container } from 'tsyringe';
import { ShowJobService } from '../infrastructure/services/showAgenda.service';
import { MoviePassJobService } from '../infrastructure/services/moviePass.service';

export async function initializeAgenda(): Promise<void> {
  const showJobService = container.resolve(ShowJobService);
  const moviePassJobService = container.resolve(MoviePassJobService);
  await Promise.all([showJobService.startAgenda(), moviePassJobService.startAgenda()]);
}
