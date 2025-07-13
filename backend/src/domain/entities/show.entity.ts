export class Show {
  constructor(
    public _id: string,
    public startTime: Date,
    public movieId: string | any,
    public theaterId: string | any,
    public screenId: string | any,
    public vendorId: string | any,
    public status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled',
    public bookedSeats: {
      date: Date;
      isPending: boolean;
      seatNumber: string;
      seatPrice: number;
      type: 'VIP' | 'Regular' | 'Premium';
      position: { row: number; col: number };
      userId: string | any;
    }[] = [],
    public endTime?: Date,
    public showDate?: Date,
  ) {}
}
