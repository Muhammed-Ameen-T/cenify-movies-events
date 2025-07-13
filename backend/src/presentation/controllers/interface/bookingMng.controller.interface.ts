import { NextFunction, Request, Response } from 'express';

export interface IBookingMngController {
  createBooking(req: Request, res: Response, next:NextFunction): Promise<void>;
  checkPaymentOptions(req: Request, res: Response, next:NextFunction): Promise<void>;
  fetchBookings(req: Request, res: Response, next:NextFunction): Promise<void>;
  findBookingsOfVendor(req: Request, res: Response, next:NextFunction): Promise<void>;
  findBookingById(req: Request, res: Response, next:NextFunction): Promise<void>;
  findBookingsOfUser(req: Request, res: Response, next:NextFunction): Promise<void>;
  cancelBooking(req: Request, res: Response, next:NextFunction): Promise<void>;
}
