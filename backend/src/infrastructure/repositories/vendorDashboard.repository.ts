import mongoose, { Types } from 'mongoose';
import BookingModel from '../database/booking.model';
import ShowModel from '../database/show.model';
import { TheaterModel } from '../database/theater.model';
import ScreenModel from '../database/screen.model';
import SeatLayoutModel from '../database/seatLayout.model';
import {
  DashboardQueryParams,
  VendorStatistics,
  MonthlyRevenue,
  OccupancyRate,
  TopSellingShow,
  TopTheater,
} from '../../domain/interfaces/model/vendorDashboard.interface';
import { IDashboardRepository } from '../../domain/interfaces/repositories/dashboard.repository';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { UserModel } from '../database/user.model';

export class DashboardRepository implements IDashboardRepository {
  async getDashboardData(
    vendorId: string,
    params: DashboardQueryParams,
  ): Promise<{
    statistics: VendorStatistics;
    monthlyRevenue: MonthlyRevenue[];
    occupancyRate: OccupancyRate[];
    topSellingShows: TopSellingShow[];
    topTheaters: TopTheater[];
  }> {
    try {
      const { startDate, endDate, status, location } = params;
      const vendorObjectId = new Types.ObjectId(vendorId);

      // Validate vendor
      const vendor = await UserModel.findOne({ _id: vendorObjectId, role: 'vendor' }).lean();
      if (!vendor) {
        throw new Error(ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      }

      // Get vendor's theater IDs
      const theaterMatch: any = { vendorId: vendorObjectId };
      if (status) theaterMatch.status = status;
      if (location) theaterMatch['location.city'] = new RegExp(location, 'i');
      const theaters = await TheaterModel.find(theaterMatch).select('_id').lean();
      const theaterIds = theaters.map((t) => new mongoose.Types.ObjectId(t._id));
      console.log('Theater IDs:', theaterIds); // Debug log

      // Get vendor's show IDs
      const showMatch: any = { vendorId: vendorObjectId, theaterId: { $in: theaterIds } };
      const shows = await ShowModel.find(showMatch).select('_id').lean();
      const showIds = shows.map((s) => s._id);
      console.log('Show IDs:', showIds); // Debug log

      // Base booking match
      const bookingMatch: any = {
        showId: { $in: showIds },
        status: 'confirmed',
        'payment.status': 'completed',
      };
      if (startDate) bookingMatch.createdAt = { $gte: new Date(startDate) };
      if (endDate) bookingMatch.createdAt = { ...bookingMatch.createdAt, $lte: new Date(endDate) };
      console.log('Booking Match:', bookingMatch); // Debug log

      // Fetch all data in parallel
      const [statistics, monthlyRevenue, occupancyRate, topSellingShows, topTheaters] =
        await Promise.all([
          this.getStatistics(bookingMatch, theaterIds, vendorId),
          this.getMonthlyRevenue(bookingMatch),
          this.getOccupancyRates(theaterIds, bookingMatch),
          this.getTopSellingShows(bookingMatch),
          this.getTopTheaters(theaterIds, bookingMatch),
        ]);

      return {
        statistics,
        monthlyRevenue,
        occupancyRate,
        topSellingShows,
        topTheaters,
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FETCHING_DASHBOARD);
    }
  }

  private async getStatistics(
    bookingMatch: any,
    theaterIds: Types.ObjectId[],
    vendorId: string,
  ): Promise<VendorStatistics> {
    // Total Revenue and Tickets Sold
    const bookingStats = await BookingModel.aggregate([
      { $match: bookingMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: { $size: '$bookedSeatsId' } },
        },
      },
    ]);

    // Active Shows
    const activeShowMatch: any = {
      vendorId: new Types.ObjectId(vendorId),
      theaterId: { $in: theaterIds },
      status: { $in: ['Scheduled', 'Running'] },
    };
    const activeShows = await ShowModel.countDocuments(activeShowMatch);

    // Average Occupancy
    const occupancyStats = await BookingModel.aggregate([
      { $match: bookingMatch },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: '$show' },
      {
        $lookup: {
          from: 'screens',
          localField: 'show.screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      { $unwind: '$screen' },
      {
        $lookup: {
          from: 'seatlayouts',
          localField: 'screen.seatLayoutId',
          foreignField: '_id',
          as: 'seatLayout',
        },
      },
      { $unwind: '$seatLayout' },
      {
        $group: {
          _id: null,
          totalSeats: { $sum: '$seatLayout.capacity' },
          bookedSeats: { $sum: { $size: '$bookedSeatsId' } },
        },
      },
      {
        $project: {
          averageOccupancy: {
            $cond: [
              { $eq: ['$totalSeats', 0] },
              0,
              { $multiply: [{ $divide: ['$bookedSeats', '$totalSeats'] }, 100] },
            ],
          },
        },
      },
    ]);

    return {
      totalRevenue: bookingStats[0]?.totalRevenue || 0,
      ticketsSold: bookingStats[0]?.ticketsSold || 0,
      activeShows,
      averageOccupancy: occupancyStats[0]?.averageOccupancy || 0,
    };
  }

  private async getMonthlyRevenue(bookingMatch: any): Promise<MonthlyRevenue[]> {
    return BookingModel.aggregate([
      { $match: bookingMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          value: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          name: {
            $dateToString: {
              format: '%b',
              date: { $dateFromString: { dateString: '$_id' } },
            },
          },
          value: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getOccupancyRates(
    theaterIds: Types.ObjectId[],
    bookingMatch: any,
  ): Promise<OccupancyRate[]> {
    if (!theaterIds.length) {
      console.warn('No theater IDs provided for occupancy rates');
      return [];
    }

    return BookingModel.aggregate([
      { $match: bookingMatch }, // Match bookings first
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: { path: '$show', preserveNullAndEmptyArrays: true } },
      {
        $match: { 'show.theaterId': { $in: theaterIds } }, // Apply theaterId filter after lookup
      },
      {
        $lookup: {
          from: 'screens',
          localField: 'show.screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      { $unwind: { path: '$screen', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'seatlayouts',
          localField: 'screen.seatLayoutId',
          foreignField: '_id',
          as: 'seatLayout',
        },
      },
      { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'theaters',
          localField: 'show.theaterId',
          foreignField: '_id',
          as: 'theater',
        },
      },
      { $unwind: { path: '$theater', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$theater._id',
          name: { $first: '$theater.name' },
          totalSeats: { $sum: { $ifNull: ['$seatLayout.capacity', 0] } },
          bookedSeats: { $sum: { $size: { $ifNull: ['$bookedSeatsId', []] } } },
        },
      },
      {
        $project: {
          name: 1,
          rate: {
            $cond: [
              { $eq: ['$totalSeats', 0] },
              0,
              { $multiply: [{ $divide: ['$bookedSeats', '$totalSeats'] }, 100] },
            ],
          },
        },
      },
      { $sort: { rate: -1 } }, // Sort by occupancy rate
    ]);
  }

  private async getTopSellingShows(bookingMatch: any): Promise<TopSellingShow[]> {
    return BookingModel.aggregate([
      { $match: bookingMatch },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: '$show' },
      {
        $lookup: {
          from: 'movies',
          localField: 'show.movieId',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$show._id',
          title: { $first: '$movie.name' },
          tickets: { $sum: { $size: '$bookedSeatsId' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { tickets: -1 } },
      { $limit: 4 },
      {
        $project: {
          id: '$_id',
          title: 1,
          tickets: 1,
          revenue: 1,
        },
      },
    ]);
  }

  private async getTopTheaters(
    theaterIds: Types.ObjectId[],
    bookingMatch: any,
  ): Promise<TopTheater[]> {
    if (!theaterIds.length) {
      console.warn('No theater IDs provided for top theaters');
      return [];
    }

    return BookingModel.aggregate([
      { $match: bookingMatch }, // Match bookings first
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: { path: '$show', preserveNullAndEmptyArrays: true } },
      {
        $match: { 'show.theaterId': { $in: theaterIds } }, // Apply theaterId filter after lookup
      },
      {
        $lookup: {
          from: 'screens',
          localField: 'show.screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      { $unwind: { path: '$screen', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'seatlayouts',
          localField: 'screen.seatLayoutId',
          foreignField: '_id',
          as: 'seatLayout',
        },
      },
      { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'theaters',
          localField: 'show.theaterId',
          foreignField: '_id',
          as: 'theater',
        },
      },
      { $unwind: { path: '$theater', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$theater._id',
          name: { $first: '$theater.name' },
          tickets: { $sum: { $size: { $ifNull: ['$bookedSeatsId', []] } } },
          revenue: { $sum: '$totalAmount' },
          totalSeats: { $sum: { $ifNull: ['$seatLayout.capacity', 0] } },
          bookedSeats: { $sum: { $size: { $ifNull: ['$bookedSeatsId', []] } } },
        },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          tickets: 1,
          revenue: 1,
          occupancyRate: {
            $cond: [
              { $eq: ['$totalSeats', 0] },
              0,
              { $multiply: [{ $divide: ['$bookedSeats', '$totalSeats'] }, 100] },
            ],
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);
  }
}
