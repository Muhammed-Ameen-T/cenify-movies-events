// src/domain/interfaces/useCases/User/findProfileContents.interface.ts

export interface IFindProfileContentsUseCase {
  execute(userId: string): Promise<{
    walletBalance: number;
    bookingsCount: number;
    moviePass: any; // You can replace `any` with a proper MoviePass type if defined
  }>;
}
