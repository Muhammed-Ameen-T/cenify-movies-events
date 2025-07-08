import { Show } from '../../../entities/show.entity';

export interface IUpdateShowStatusUseCase {
  execute(id: string, status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled'): Promise<Show>;
}
