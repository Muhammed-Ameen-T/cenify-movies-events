export interface IDeleteShowUseCase {
  execute(id: string): Promise<void>;
}
