import { ve } from '../domain/entities/theater.entity';

export class TempStore {
  private static store: Map<string, { theater: Theater; otp: string }> = new Map();

  static set(email: string, theater: Theater, otp: string): void {
    this.store.set(email, { theater, otp });
  }

  static get(email: string): { theater: Theater; otp: string } | undefined {
    return this.store.get(email);
  }

  static delete(email: string): void {
    this.store.delete(email);
  }
}
