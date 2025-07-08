import { Show } from '../../../entities/show.entity';

export interface ICreateRecurringShowUseCase {
  execute(showId: string, startDate: string, endDate: string, vendorId: string): Promise<Show[]>;
}
