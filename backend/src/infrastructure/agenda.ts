import { container } from 'tsyringe';
import { ShowJobService } from '../infrastructure/services/showAgenda.service';
import { MoviePassJobService } from '../infrastructure/services/moviePass.service';
// import { VendorPayoutJobService } from '../infrastructure/services/scheduleVendorPayouts.service';

export async function initializeAgenda(): Promise<void> {
  const showJobService = container.resolve(ShowJobService);
  const moviePassJobService = container.resolve(MoviePassJobService);
  // const vendorPayoutJobService = container.resolve(VendorPayoutJobService);
  await Promise.all([showJobService.startAgenda(), moviePassJobService.startAgenda()]);
}
