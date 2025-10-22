// src/infrastructure/repositories/adminDashboard.repository.ts
import { Types, FilterQuery, PipelineStage } from 'mongoose';
import BookingModel from '../database/booking.model';
import ShowModel from '../database/show.model';
import { TheaterModel } from '../database/theater.model';
import {
  AdminStatistics,
  SalesData,
  TopTheater,
  TopShow,
  TheaterStatus,
  AdminDashboardQueryParams,
} from '../../domain/interfaces/model/adminDashboard.interface';
import { IAdminDashboardRepository } from '../../domain/interfaces/repositories/adminDashboard.repository';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { UserModel } from '../database/user.model';
import { IBooking } from '../../domain/interfaces/model/booking.interface';
import { ITheater } from '../../domain/interfaces/model/thaeter.interface';

interface BookingStatsResult {
  totalRevenue: number;
  totalBookings: number;
}
interface TheaterStatsResult {
  totalTheaters: number;
  averageRating: number;
}

interface SalesAggregationResult {
  _id: string; // The formatted date string
  revenue: number;
}
interface SalesDataProjectedResult {
  _id: string;
  name: string;
  revenue: number;
}

interface TopTheaterCurrentStats {
  _id: Types.ObjectId;
  name: string;
  location: string;
  revenue: number;
  bookings: number;
  rating: number;
}
interface TopTheaterPreviousStats {
  _id: Types.ObjectId;
  previousRevenue: number;
}
interface TopShowAggregationResult {
  _id: Types.ObjectId;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  poster: string;
  bookings: number;
  revenue: number;
}

interface TopShowProjectedResult {
  id: Types.ObjectId; 
  title: string;
  genre: string;
  duration: string;
  rating: number;
  poster: string;
  bookings: number;
  revenue: number;
  isHot: boolean;
}

interface HotShowIdResult {
  hotShowIds: Types.ObjectId[];
}


export class AdminDashboardRepository implements IAdminDashboardRepository {
  async getDashboardData(
    adminId: string,
    params: AdminDashboardQueryParams,
  ): Promise<{
    statistics: AdminStatistics;
    sales: SalesData[];
    topTheaters: TopTheater[];
    topShows: TopShow[];
    theaterStatus: TheaterStatus[];
  }> {
    try {
      const admin = await UserModel.findOne({ _id: adminId, role: 'admin' }).lean();
      if (!admin) {
        throw new Error(ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      }

      const { period = 'monthly', startDate, endDate, location } = params; 

      const bookingMatch: FilterQuery<IBooking> = {
        status: 'confirmed',
        'payment.status': 'completed',
      };
      const dateRange: FilterQuery<IBooking>['createdAt'] = {};
      if (startDate) dateRange.$gte = new Date(startDate);
      if (endDate) dateRange.$lte = new Date(endDate);

      if (Object.keys(dateRange).length > 0) {
        bookingMatch.createdAt = dateRange;
      } 

      const theaterMatch: FilterQuery<ITheater> = {};
      if (location) theaterMatch['location.city'] = new RegExp(location, 'i'); 

      const [statistics, sales, topTheaters, topShows, theaterStatus] = await Promise.all([
        this.getStatistics(bookingMatch, theaterMatch, period),
        this.getSalesData(bookingMatch, period),
        this.getTopTheaters(bookingMatch, theaterMatch, period),
        this.getTopShows(bookingMatch),
        this.getTheaterStatus(theaterMatch),
      ]);

      return {
        statistics,
        sales,
        topTheaters,
        topShows,
        theaterStatus,
      };
    } catch (error) {
      console.error('❌ Error fetching admin dashboard data:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FETCHING_DASHBOARD);
    }
  }

  private async getStatistics(
    bookingMatch: FilterQuery<IBooking>,
    theaterMatch: FilterQuery<ITheater>,
    period: string = 'monthly',
  ): Promise<AdminStatistics> {
    let dateFormat: string;
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        break;
      case 'annually':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }

    const istDateAdd: PipelineStage.Project['$project'] = {
      totalAmount: 1,
      bookedSeatsId: 1,
      createdAt: {
        $dateAdd: {
          startDate: '$createdAt',
          unit: 'minute',
          amount: 330, // IST offset: +5 hours 30 minutes
        },
      },
    };

    const [bookingStatsRaw, theaterStatsRaw] = await Promise.all([
      BookingModel.aggregate<BookingStatsResult>([
        { $match: bookingMatch },
        { $project: istDateAdd },
        {
          $group: {
            _id:
              period !== 'all'
                ? { $dateToString: { format: dateFormat, date: '$createdAt' } }
                : null,
            totalRevenue: { $sum: '$totalAmount' },
            totalBookings: { $sum: { $size: '$bookedSeatsId' } },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalRevenue' },
            totalBookings: { $sum: '$totalBookings' },
          },
        },
      ]),
      TheaterModel.aggregate<TheaterStatsResult>([
        { $match: theaterMatch },
        {
          $group: {
            _id: null,
            totalTheaters: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]),
    ]);

    const bookingStats = bookingStatsRaw[0];
    const theaterStats = theaterStatsRaw[0];

    return {
      totalRevenue: bookingStats?.totalRevenue || 0,
      totalBookings: bookingStats?.totalBookings || 0,
      totalTheaters: theaterStats?.totalTheaters || 0,
      averageRating: theaterStats?.averageRating || 0,
    };
  }

  private async getSalesData(
    bookingMatch: FilterQuery<IBooking>,
    period: string,
  ): Promise<SalesData[]> {
    let dateFormat: string;
    let displayFormat: string;
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        displayFormat = '%d %b %Y';
        break;
      case 'annually':
        dateFormat = '%Y';
        displayFormat = '%Y'; 
        break;
      default:
        dateFormat = '%Y-%m';
        displayFormat = '%b %Y';
    } 

    const sales = await BookingModel.aggregate<SalesDataProjectedResult>([
      { $match: bookingMatch },
      {
        $project: {
          totalAmount: 1,
          createdAt: {
            $dateAdd: {
              startDate: '$createdAt',
              unit: 'minute',
              amount: 330, // IST offset: +5 hours 30 minutes
            },
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          _id: '$_id',
          name: {
            $cond: {
              if: { $eq: [period, 'annually'] },
              then: '$_id', 
              else: {
                $dateToString: {
                  format: displayFormat,
                  date: { $dateFromString: { dateString: '$_id' } },
                },
              },
            },
          },
          revenue: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]); 

    return sales.map((s) => ({ name: s.name, revenue: s.revenue }));
  }
  private async getTopTheaters(
    bookingMatch: FilterQuery<IBooking>,
    theaterMatch: FilterQuery<ITheater>,
    period: string,
  ): Promise<TopTheater[]> {
    // Get current period revenue and bookings
    const currentStats = await BookingModel.aggregate<TopTheaterCurrentStats>([
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
          from: 'theaters',
          localField: 'show.theaterId',
          foreignField: '_id',
          as: 'theater',
        },
      },
      { $unwind: { path: '$theater', preserveNullAndEmptyArrays: false } },
      { $match: theaterMatch },
      {
        $group: {
          _id: '$theater._id',
          name: { $first: '$theater.name' },
          location: { $first: '$theater.location.city' },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: { $size: '$bookedSeatsId' } },
          rating: { $first: '$theater.rating' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]); 

    const previousBookingMatch: FilterQuery<IBooking> = { ...bookingMatch };
    const dateRange = bookingMatch.createdAt as { $gte?: Date; $lte?: Date };
    const endDate = dateRange?.$lte || new Date();
    const startDate = dateRange?.$gte || new Date();

    let previousStartDate: Date, previousEndDate: Date;

    if (period === 'daily') {
      previousEndDate = new Date(startDate.getTime());
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
    } else if (period === 'monthly') {
      previousEndDate = new Date(startDate.getTime());
      previousEndDate.setMonth(previousEndDate.getMonth() - 1);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1); 
      previousStartDate.setDate(1);
    } else {
      previousEndDate = new Date(startDate.getTime());
      previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
    } 
    previousBookingMatch.createdAt = {
      $gte: previousStartDate,
      $lte: previousEndDate,
    }; 

    const previousStats = await BookingModel.aggregate<TopTheaterPreviousStats>([
      { $match: previousBookingMatch },
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
          from: 'theaters',
          localField: 'show.theaterId',
          foreignField: '_id',
          as: 'theater',
        },
      },
      { $unwind: { path: '$theater', preserveNullAndEmptyArrays: false } },
      { $match: theaterMatch },
      {
        $group: {
          _id: '$theater._id',
          previousRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const previousRevenueMap = new Map(
      previousStats.map((s) => [s._id.toString(), s.previousRevenue]),
    );

    return currentStats.map((t, index) => {
      const previousRevenue = previousRevenueMap.get(t._id.toString()) || 0;
      const growth =
        previousRevenue > 0
          ? ((t.revenue - previousRevenue) / previousRevenue) * 100
          : t.revenue > 0
            ? 100
            : 0;

      return {
        // FIX 1: Return _id as Types.ObjectId as required by TopTheater interface
        id: t._id, 
        name: t.name,
        location: t.location,
        revenue: t.revenue,
        bookings: t.bookings,
        rating: t.rating || 0,
        growth,
        rank: index + 1,
      };
    });
  }

  private async getTopShows(bookingMatch: FilterQuery<IBooking>): Promise<TopShow[]> {
    const hotThresholdDate = new Date();
    hotThresholdDate.setDate(hotThresholdDate.getDate() - 7); 

    const totalShowsCount = await ShowModel.countDocuments().exec();
    const hotLimit = Math.ceil(0.25 * totalShowsCount);
    
    const hotShowsRaw = await BookingModel.aggregate<HotShowIdResult>([
      {
        $match: {
          status: 'confirmed',
          'payment.status': 'completed',
          createdAt: { $gte: hotThresholdDate },
        },
      },
      {
        $group: {
          _id: '$showId',
          bookings: { $sum: { $size: '$bookedSeatsId' } },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: hotLimit },
      {
        $group: {
          _id: null,
          hotShowIds: { $push: '$_id' },
        },
      },
    ]);

    const hotShowIds: Types.ObjectId[] = hotShowsRaw[0]?.hotShowIds || []; 

    const shows = await BookingModel.aggregate<TopShowProjectedResult>([
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
          genre: {
            $first: {
              $reduce: {
                input: '$movie.genre',
                initialValue: '',
                in: {
                  $concat: [
                    '$$value',
                    { $cond: { if: { $eq: ['$$value', ''] }, then: '', else: ', ' } },
                    '$$this',
                  ],
                },
              },
            },
          },
          duration: {
            $first: {
              $concat: [
                { $toString: '$movie.duration.hours' },
                'h ',
                { $toString: '$movie.duration.minutes' },
                'm',
              ],
            },
          },
          rating: { $first: '$movie.rating' },
          poster: { $first: '$movie.poster' },
          bookings: { $sum: { $size: '$bookedSeatsId' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 4 },
      {
        $project: {
          id: '$_id', 
          title: 1,
          genre: 1,
          duration: 1,
          rating: 1,
          poster: 1,
          bookings: 1,
          revenue: 1,
          isHot: { $in: ['$_id', hotShowIds] },
        },
      },
    ]); 

    return shows.map(
      (show) =>
        ({
          ...show,
          id: show.id.toString(), 
        }) as unknown as TopShow, 
    );
  }

  private async getTheaterStatus(theaterMatch: FilterQuery<ITheater>): Promise<TheaterStatus[]> {
    interface StatusCountResult {
      _id: ITheater['status'];
      value: number;
      name: ITheater['status'];
      color: string;
    }

    const statusCounts = await TheaterModel.aggregate<StatusCountResult>([
      { $match: theaterMatch },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          color: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'verified'] }, then: '#10b981' },
                { case: { $eq: ['$_id', 'verifying'] }, then: '#f59e0b' },
                { case: { $eq: ['$_id', 'blocked'] }, then: '#ef4444' },
              ],
              default: '#6b7280',
            },
          },
        },
      },
    ]); 

    const capitalize = (str: string): string =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); 

    const statusMap: { [key in ITheater['status'] | 'pending' | string]: string } = {
      verified: '#10b981',
      verifying: '#f59e0b',
      blocked: '#ef4444',
      pending: '#6b7280', 
    };

    const result: TheaterStatus[] = Object.keys(statusMap)
      .filter((key): key is ITheater['status'] =>
        ['verified', 'verifying', 'blocked'].includes(key),
      ) 
      .map((statusKey) => {
        const countEntry = statusCounts.find((s) => s.name === statusKey);
        return {
          name: capitalize(statusKey),
          value: countEntry?.value || 0,
          color: statusMap[statusKey],
        };
      });

    return result;
  }
}