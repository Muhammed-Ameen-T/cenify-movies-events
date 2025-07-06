import { IBookingRepository } from '../../domain/interfaces/repositories/booking.repository';
import { Booking } from '../../domain/entities/booking.entity';
import BookingModel from '../database/booking.model';
import ShowModel from '../database/show.model';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';

export class BookingRepository implements IBookingRepository {
  async create(booking: Booking): Promise<Booking> {
    try {
      const newBooking = new BookingModel(booking);
      const savedBooking = await newBooking.save();
      return this.mapToEntity(savedBooking);
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_CREATING_BOOKING);
    }
  }
  async findById(bookingId: string): Promise<Booking | null> {
    try {
      const bookingDoc = await BookingModel.findById(bookingId)
        .populate({
          path: 'showId',
          model: 'Show',
          populate: [
            { path: 'movieId', model: 'Movie' },
            { path: 'theaterId', model: 'Theater' },
          ],
        })
        .populate({ path: 'userId', model: 'User' })
        .lean();

      return bookingDoc ? this.mapToEntity(bookingDoc) : null;
    } catch (error) {
      console.error('❌ Error finding booking:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_BOOKING);
    }
  }

  async findByBookingId(bookingId: string): Promise<Booking | null> {
    try {
      const bookingDoc = await BookingModel.findOne({ bookingId })
        .populate({
          path: 'showId',
          model: 'Show',
          populate: [
            { path: 'movieId', model: 'Movie' },
            { path: 'theaterId', model: 'Theater' },
          ],
        })
        .populate({ path: 'userId', model: 'User' })
        .populate({ path: 'bookedSeatsId', model: 'Seat' })
        .lean();

      return bookingDoc ? this.mapToEntity(bookingDoc) : null;
    } catch (error) {
      console.error('❌ Error finding booking:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_BOOKING);
    }
  }

  async findBookingsOfUser(params: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number }> {
    try {
      const { userId, page = 1, limit = 8, status, sortBy, sortOrder } = params;
      const skip = (page - 1) * limit;

      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      if (status && status.length > 0) {
        query['status'] = { $in: status };
      }

      const sort: any = {};
      if (sortBy && sortOrder) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      const bookingDocs = await BookingModel.find(query)
        .populate({
          path: 'showId',
          model: 'Show',
          populate: [
            { path: 'movieId', model: 'Movie' },
            { path: 'theaterId', model: 'Theater' },
          ],
        })
        .populate({ path: 'userId', model: 'User' })
        .populate({ path: 'bookedSeatsId', model: 'Seat' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const totalCount = await BookingModel.countDocuments(query);

      return {
        bookings: bookingDocs.map(this.mapToEntity),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error finding bookings for user:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_BOOKING);
    }
  }

  async findAllBookings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number }> {
    try {
      const { page = 1, limit = 8, search, status, sortBy, sortOrder } = params || {};
      const skip = (page - 1) * limit;

      const query: any = {};
      if (search) {
        query.bookingId = { $regex: search, $options: 'i' };
      }
      if (status && status.length > 0) {
        query.status = { $in: status };
      }

      const sort: any = {};
      if (sortBy && sortOrder) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      const bookingDocs = await BookingModel.find(query)
        .populate({
          path: 'showId',
          model: 'Show',
          populate: [
            { path: 'movieId', model: 'Movie' },
            { path: 'theaterId', model: 'Theater' },
          ],
        })
        .populate({ path: 'userId', model: 'User' })
        .populate({ path: 'bookedSeatsId', model: 'Seat' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const totalCount = await BookingModel.countDocuments(query);

      return {
        bookings: bookingDocs.map(this.mapToEntity),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error finding all bookings:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_BOOKING);
    }
  }

  async updatePaymentStatusAndId(bookingId: string, paymentId: string): Promise<void> {
    try {
      await BookingModel.findByIdAndUpdate(bookingId, {
        'payment.status': 'completed',
        'payment.paymentId': paymentId,
      });
    } catch (error) {
      console.error(`❌ Error updating payment for booking ${bookingId}:`, error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_UPDATING_BOOKING);
    }
  }

  async findBookingsOfVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    status?: string[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number }> {
    try {
      const { vendorId, page = 1, limit = 8, search, status, sortBy, sortOrder } = params;

      const skip = (page - 1) * limit;

      // First, find all showIds that belong to the vendor
      const shows = await mongoose.model('Show').find({ vendorId }, { _id: 1 }).lean();
      const showIds = shows.map((show) => show._id);

      const query: any = {
        showId: { $in: showIds },
      };

      if (search) {
        query.bookingId = { $regex: search, $options: 'i' };
      }
      if (status && status.length > 0) {
        query.status = { $in: status };
      }

      const sortQuery: any = {};
      if (sortBy && sortOrder) {
        sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sortQuery.createdAt = -1;
      }

      const bookingDocs = await BookingModel.find(query)
        .populate({
          path: 'showId',
          model: 'Show',
          populate: [
            { path: 'movieId', model: 'Movie' },
            { path: 'theaterId', model: 'Theater' },
          ],
        })
        .populate({ path: 'userId', model: 'User' })
        .populate({ path: 'bookedSeatsId', model: 'Seat' })
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

      const totalCount = await BookingModel.countDocuments(query);

      return {
        bookings: bookingDocs.map(this.mapToEntity),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error finding vendor bookings:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_BOOKING);
    }
  }

  async cancelBooking(bookingId: string, reason: string): Promise<Booking | null> {
    try {
      const booking = await BookingModel.findOne({ _id: bookingId })
        .populate({ path: 'showId', select: '_id' }) // Only need showId
        .populate({ path: 'userId', select: '_id' }) // Only need userId
        .populate({ path: 'bookedSeatsId', model: 'Seat', select: 'number' }) // Populate Seat documents to get seat numbers
        .lean();

      if (!booking) {
        throw new Error(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND);
      }

      if (booking.status === 'cancelled') {
        return this.mapToEntity(booking);
      }

      const updatedBookingDoc = await BookingModel.findByIdAndUpdate(
        booking._id,
        { status: 'cancelled', reason: reason },
        { new: true },
      )
        .populate({
          path: 'showId',
          model: 'Show',
          populate: [
            { path: 'movieId', model: 'Movie' },
            { path: 'theaterId', model: 'Theater' },
          ],
        })
        .populate({ path: 'userId', model: 'User' })
        .populate({ path: 'bookedSeatsId', model: 'Seat' })
        .lean();

      if (!updatedBookingDoc) {
        throw new Error(ERROR_MESSAGES.GENERAL.FAILED_CANCELLING_BOOKING);
      }

      const showId = booking.showId._id;
      const userId = booking.userId._id;
      const seatNumbersToPull = booking.bookedSeatsId.map((seat: any) => seat.number);

      await ShowModel.updateOne(
        { _id: showId },
        {
          $pull: {
            bookedSeats: {
              userId: userId,
              seatNumber: { $in: seatNumbersToPull },
            },
          },
        },
      );

      return this.mapToEntity(updatedBookingDoc);
    } catch (error) {
      console.error('❌ Error canceling booking:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_CANCELLING_BOOKING);
    }
  }

  async countBookings(userId: string): Promise<number> {
    return await BookingModel.countDocuments({ userId });
  }

  private mapToEntity(doc: any): Booking {
    return new Booking(
      doc._id ?? null,
      doc.showId,
      doc.userId,
      doc.bookedSeatsId,
      doc.bookingId,
      doc.status,
      doc.payment,
      doc.qrCode,
      doc.subTotal,
      doc.couponDiscount,
      doc.couponApplied,
      doc.convenienceFee,
      doc.donation,
      doc.moviePassApplied,
      doc.moviePassDiscount ?? 0,
      doc.totalDiscount ?? 0,
      doc.totalAmount,
      doc.offerDiscount ?? 0,
      doc.expiresAt,
      doc.reason,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
