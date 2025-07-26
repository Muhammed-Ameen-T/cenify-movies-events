// src/domain/interfaces/useCases/Auth/refreshToken.interface.ts
export interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<string>;
}
