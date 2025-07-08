import { Response } from 'express';

export interface IUpdateTheaterStatusUseCase {
  execute(id: string, status: string, res: Response): Promise<void>;
}
