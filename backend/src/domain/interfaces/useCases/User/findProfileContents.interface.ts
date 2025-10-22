import { MoviePass } from "../../../entities/moviePass.entity";

export interface IFindProfileContentsUseCase {
  execute(userId: string): Promise<{
    walletBalance: number;
    bookingsCount: number;
    moviePass: MoviePass | null; 
  }>;
}
