import { Request, Response } from 'express';

export interface IBookingMngController {
  createBooking(req: Request, res: Response): Promise<void>;
  checkPaymentOptions(req: Request, res: Response): Promise<void>;
  fetchBookings(req: Request, res: Response): Promise<void>;
  findBookingsOfVendor(req: Request, res: Response): Promise<void>;
  findBookingById(req: Request, res: Response): Promise<void>;
  findBookingsOfUser(req: Request, res: Response): Promise<void>;
  cancelBooking(req: Request, res: Response): Promise<void>;
}
