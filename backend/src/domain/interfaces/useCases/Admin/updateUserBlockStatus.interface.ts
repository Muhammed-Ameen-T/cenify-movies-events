// src/domain/interfaces/useCases/Admin/updateUserBlockStatus.interface.ts
import { Response } from 'express';
import { UpdateUserBlockStatusDTO } from '../../../../application/dtos/user.dto';

export interface IUpdateUserBlockStatusUseCase {
  execute(id: string, data: UpdateUserBlockStatusDTO, res: Response): Promise<void>;
}
