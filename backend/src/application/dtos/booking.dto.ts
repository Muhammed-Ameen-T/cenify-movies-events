export class CreateBookingDTO {
  constructor(
    public showId: string,
    public userId: string,
    public bookedSeatsId: string[],
    public payment: {
      amount: number;
      method: 'wallet' | 'online' | 'stripe';
      paymentId?: string;
      status: 'pending' | 'completed';
    },
    public subTotal: number,
    public convenienceFee: number,
    public donation: number,
    public totalAmount: number,
    public couponDiscount?: number,
    public couponApplied?: boolean,
    public moviePassDiscount?: number,
    public moviePassApplied?: boolean,
    public expiresAt?: Date,
  ) {}
}
