// src/infrastructure/repositories/adminDashboard.repository.ts
import mongoose, { Types, FilterQuery, PipelineStage } from 'mongoose';
import BookingModel from '../database/booking.model';
import ShowModel from '../database/show.model';
import { TheaterModel } from '../database/theater.model';
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


interface ITheater {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  status: string;
  location: { city: string };
}
interface IShow {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  theaterId: Types.ObjectId;
  screenId: Types.ObjectId;
  status: string;
}
interface IBooking {
  _id: Types.ObjectId;
  showId: Types.ObjectId;
  status: 'confirmed' | string;
  totalAmount: number;
  bookedSeatsId: Types.ObjectId[];
  createdAt: Date;
  payment: { status: 'completed' | string };
}

// --- AGGREGATION RESULT INTERFACES (Using correct ID types) ---

interface BookingStatsResult {
  totalRevenue: number;
  ticketsSold: number;
}

interface OccupancyGroupResult {
  _id: Types.ObjectId; // Theater ID
  name: string;
  totalSeats: number;
  bookedSeats: number;
}

interface MonthlyRevenueResult {
  _id: string; // '%Y-%m' string
  name: string; // '%b' string
  value: number;
}

interface TopSellingShowProjectedResult {
  id: Types.ObjectId; // This ID MUST be Types.ObjectId to match the TopSellingShow interface
  title: string;
  tickets: number;
  revenue: number;
  showTime: Date;
}

interface TopTheaterProjectedResult {
  id: Types.ObjectId; // This ID MUST be Types.ObjectId to match the TopTheater interface
  name: string;
  tickets: number;
  revenue: number;
  occupancyRate: number;
}


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
      const theaterMatch: FilterQuery<ITheater> = { vendorId: vendorObjectId };
      if (status) theaterMatch.status = status;
      if (location) theaterMatch['location.city'] = new RegExp(location, 'i');
      const theaters = await TheaterModel.find(theaterMatch).select('_id').lean();
      const theaterIds: Types.ObjectId[] = theaters.map((t) => new Types.ObjectId(t._id));

      // Get vendor's show IDs
      const showMatch: FilterQuery<IShow> = { vendorId: vendorObjectId, theaterId: { $in: theaterIds } };
      const shows = await ShowModel.find(showMatch).select('_id').lean();
      const showIds = shows.map((s) => s._id);

      // Base booking match
      const bookingMatch: FilterQuery<IBooking> = {
        showId: { $in: showIds },
        status: 'confirmed',
        'payment.status': 'completed',
      };
      
      const dateRange: FilterQuery<IBooking>['createdAt'] = {};
      if (startDate) dateRange.$gte = new Date(startDate);
      if (endDate) dateRange.$lte = new Date(endDate);
      
      if (Object.keys(dateRange).length > 0) {
        bookingMatch.createdAt = dateRange;
      }

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
    bookingMatch: FilterQuery<IBooking>,
    theaterIds: Types.ObjectId[],
    vendorId: string,
  ): Promise<VendorStatistics> {
    // Total Revenue and Tickets Sold
    const bookingStats = await BookingModel.aggregate<BookingStatsResult>([
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
    const activeShowMatch: FilterQuery<IShow> = {
      vendorId: new Types.ObjectId(vendorId),
      theaterId: { $in: theaterIds },
      status: { $in: ['Scheduled', 'Running'] },
    };
    const activeShows = await ShowModel.countDocuments(activeShowMatch);

    // Average Occupancy (Aggregation logic remains correct)
    const occupancyStats = await BookingModel.aggregate<{ averageOccupancy: number }>([
      { $match: bookingMatch },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: { path: '$show', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'screens',
          localField: 'show.screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      { $unwind: { path: '$screen', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'seatlayouts',
          localField: 'screen.seatLayoutId',
          foreignField: '_id',
          as: 'seatLayout',
        },
      },
      { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: false } },
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

  private async getMonthlyRevenue(bookingMatch: FilterQuery<IBooking>): Promise<MonthlyRevenue[]> {
    const revenueData = await BookingModel.aggregate<MonthlyRevenueResult>([
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

    return revenueData.map(r => ({ name: r.name, value: r.value }));
  }

  private async getOccupancyRates(
    theaterIds: Types.ObjectId[],
    bookingMatch: FilterQuery<IBooking>,
  ): Promise<OccupancyRate[]> {
    if (!theaterIds.length) {
      console.warn('No theater IDs provided for occupancy rates');
      return [];
    }

    const occupancyRatesRaw = await BookingModel.aggregate<OccupancyGroupResult & { rate: number }>([
      { $match: bookingMatch }, 
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: { path: '$show', preserveNullAndEmptyArrays: false } },
      {
        $match: { 'show.theaterId': { $in: theaterIds } },
      },
      {
        $lookup: {
          from: 'screens',
          localField: 'show.screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      { $unwind: { path: '$screen', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'seatlayouts',
          localField: 'screen.seatLayoutId',
          foreignField: '_id',
          as: 'seatLayout',
        },
      },
      { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'theaters',
          localField: 'show.theaterId',
          foreignField: '_id',
          as: 'theater',
        },
      },
      { $unwind: { path: '$theater', preserveNullAndEmptyArrays: false } },
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
      { $sort: { rate: -1 } }, 
    ]);

    return occupancyRatesRaw.map(r => ({
      name: r.name,
      rate: r.rate,
    }));
  }

  private async getTopSellingShows(bookingMatch: FilterQuery<IBooking>): Promise<TopSellingShow[]> {
    const topShowsRaw = await BookingModel.aggregate<TopSellingShowProjectedResult>([
      { $match: bookingMatch },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: { path: '$show', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'movies',
          localField: 'show.movieId',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: { path: '$movie', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$show._id',
          title: { $first: '$movie.name' },
          tickets: { $sum: { $size: '$bookedSeatsId' } },
          revenue: { $sum: '$totalAmount' },
          startTime: { $first: '$show.startTime' },
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
          showTime: '$startTime',
        },
      },
    ]);
    
    // FIX 2: Map to TopSellingShow, using the original Types.ObjectId for the 'id' property.
    return topShowsRaw.map(s => ({
      id: s.id, // Keep as Types.ObjectId to match TopSellingShow interface
      title: s.title,
      tickets: s.tickets,
      revenue: s.revenue,
      showTime: s.showTime,
    }));
  }

  private async getTopTheaters(
    theaterIds: Types.ObjectId[],
    bookingMatch: FilterQuery<IBooking>,
  ): Promise<TopTheater[]> {
    if (!theaterIds.length) {
      console.warn('No theater IDs provided for top theaters');
      return [];
    }

    const topTheatersRaw = await BookingModel.aggregate<TopTheaterProjectedResult>([
      { $match: bookingMatch }, 
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show',
        },
      },
      { $unwind: { path: '$show', preserveNullAndEmptyArrays: false } },
      {
        $match: { 'show.theaterId': { $in: theaterIds } }, 
      },
      {
        $lookup: {
          from: 'screens',
          localField: 'show.screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      { $unwind: { path: '$screen', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'seatlayouts',
          localField: 'screen.seatLayoutId',
          foreignField: '_id',
          as: 'seatLayout',
        },
      },
      { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'theaters',
          localField: 'show.theaterId',
          foreignField: '_id',
          as: 'theater',
        },
      },
      { $unwind: { path: '$theater', preserveNullAndEmptyArrays: false } },
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

    // FIX 3: Map to TopTheater, using the original Types.ObjectId for the 'id' property.
    return topTheatersRaw.map(t => ({
      id: t.id, // Keep as Types.ObjectId to match TopTheater interface
      name: t.name,
      tickets: t.tickets,
      revenue: t.revenue,
      occupancyRate: t.occupancyRate,
    }));
  }
}