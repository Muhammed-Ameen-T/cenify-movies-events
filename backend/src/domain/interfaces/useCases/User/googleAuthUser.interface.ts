import { GoogleAuthRequestDTO, AuthResponseDTO } from '../../../../application/dtos/auth.dto';

export interface IGoogleAuthUseCase {
  execute(request: GoogleAuthRequestDTO): Promise<AuthResponseDTO>;
  // refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
}
