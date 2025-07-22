import mongoose from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { Show } from '../../domain/entities/show.entity';
import { IShowRepository } from '../../domain/interfaces/repositories/show.repository';
import ShowModel from '../database/show.model';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import ScreenModel from '../database/screen.model';
import {
  ShowSelectionMovieDTO,
  ShowSelectionResponseDTO,
  ShowSelectionTheaterDTO,
} from '../../application/dtos/show.dto';
import MovieModel from '../database/movie.model';
import { TheaterModel } from '../database/theater.model';
import seatLayoutModel from '../database/seatLayout.model';
import { IWalletRepository } from '../../domain/interfaces/repositories/wallet.repository';
import BookingModel from '../database/booking.model';
import { IBooking } from '../../domain/interfaces/model/booking.interface';
import dotenv from 'dotenv';
dotenv.config();

@injectable()
export class ShowRepository implements IShowRepository {
  constructor(@inject('WalletRepository') private walletRepository: IWalletRepository) {}

  async create(show: Show): Promise<Show> {
    try {
      const showData = {
        startTime: show.startTime,
        endTime: show.endTime,
        movieId: new mongoose.Types.ObjectId(show.movieId),
        theaterId: new mongoose.Types.ObjectId(show.theaterId),
        screenId: new mongoose.Types.ObjectId(show.screenId),
        vendorId: new mongoose.Types.ObjectId(show.vendorId),
        status: show.status || 'Scheduled',
        showDate: show.showDate, // Add showDate
        bookedSeats:
          show.bookedSeats?.map((seat) => ({
            date: seat.date,
            isPending: seat.isPending,
            seatNumber: seat.seatNumber,
            seatPrice: seat.seatPrice,
            type: seat.type,
            position: seat.position,
            userId: new mongoose.Types.ObjectId(seat.userId),
          })) || [],
      };

      const newShow = new ShowModel(showData);
      const savedShow = await newShow.save();

      // Update Screen filledTimes
      await ScreenModel.findByIdAndUpdate(show.screenId, {
        $push: {
          filledTimes: { startTime: show.startTime, endTime: show.endTime, showId: savedShow._id },
        },
      });

      return this.mapToEntity(savedShow);
    } catch (error) {
      console.error('❌ Error creating show:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(show: Show, existingShowStartTime: Date): Promise<Show> {
    try {
      const updatedShow = await ShowModel.findByIdAndUpdate(
        show._id,
        {
          startTime: show.startTime,
          endTime: show.endTime,
          movieId: new mongoose.Types.ObjectId(show.movieId),
          theaterId: new mongoose.Types.ObjectId(show.theaterId),
          screenId: new mongoose.Types.ObjectId(show.screenId),
          vendorId: new mongoose.Types.ObjectId(show.vendorId),
          status: show.status,
          showDate: show.showDate, // Add showDate
          bookedSeats: show.bookedSeats?.map((seat) => ({
            date: seat.date,
            isPending: seat.isPending,
            seatNumber: seat.seatNumber,
            seatPrice: seat.seatPrice,
            type: seat.type,
            position: seat.position,
            userId: new mongoose.Types.ObjectId(seat.userId),
          })),
        },
        { new: true },
      )
        .populate('movieId', 'name duration')
        .populate('theaterId', 'name intervalTime')
        .populate('screenId', 'name')
        .lean();

      if (!updatedShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      // Update Screen filledTimes
      await ScreenModel.updateOne(
        {
          _id: show.screenId,
          'filledTimes.showId': show._id,
          'filledTimes.startTime': existingShowStartTime,
        },
        {
          $set: {
            'filledTimes.$.startTime': show.startTime,
            'filledTimes.$.endTime': show.endTime,
          },
        },
      );
      return this.mapToEntity(updatedShow);
    } catch (error) {
      console.error('❌ Error updating show:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const show = await ShowModel.findById(id).lean();
      if (!show) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      await ShowModel.findByIdAndDelete(id);

      await ScreenModel.updateOne(
        { _id: show.screenId },
        { $pull: { filledTimes: { showId: new mongoose.Types.ObjectId(id) } } },
      );
    } catch (error) {
      console.error('❌ Error deleting show:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_DELETED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<Show | null> {
    try {
      const showDoc = await ShowModel.findById(id)
        .populate('movieId', 'name duration genre rating poster description')
        .populate('theaterId', 'name intervalTime location')
        .populate('screenId', 'name')
        .lean();
      if (!showDoc) return null;
      return this.mapToEntity(showDoc);
    } catch (error) {
      console.error('❌ Error finding show by ID:', error);
      throw new CustomError('Failed to find show', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(
    id: string,
    status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled',
  ): Promise<Show> {
    try {
      const updatedShow = await ShowModel.findByIdAndUpdate(id, { status }, { new: true })
        .populate('movieId', 'name duration')
        .populate('theaterId', 'name intervalTime')
        .populate('screenId', 'name')
        .lean();

      if (!updatedShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      return this.mapToEntity(updatedShow);
    } catch (error) {
      console.error('❌ Error updating show status:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    movieId?: string;
    screenId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shows: Show[]; totalCount: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        theaterId,
        movieId,
        screenId,
        status,
        sortBy,
        sortOrder,
      } = params;
      const skip = (page - 1) * limit;

      // Build match stage for the aggregation pipeline
      const match: any = {};
      if (theaterId) match.theaterId = new mongoose.Types.ObjectId(theaterId);
      if (movieId) match.movieId = new mongoose.Types.ObjectId(movieId);
      if (screenId) match.screenId = new mongoose.Types.ObjectId(screenId);
      if (status) match.status = status;

      // Aggregation pipeline for fetching shows
      const pipeline: any[] = [
        { $match: match },
        {
          $lookup: {
            from: 'movies',
            localField: 'movieId',
            foreignField: '_id',
            as: 'movieId',
          },
        },
        { $unwind: { path: '$movieId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'theaters',
            localField: 'theaterId',
            foreignField: '_id',
            as: 'theaterId',
          },
        },
        { $unwind: { path: '$theaterId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'screens',
            localField: 'screenId',
            foreignField: '_id',
            as: 'screenId',
          },
        },
        { $unwind: { path: '$screenId', preserveNullAndEmptyArrays: true } },
      ];

      // Add search criteria to the pipeline
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { 'movieId.name': { $regex: search, $options: 'i' } },
              { 'theaterId.name': { $regex: search, $options: 'i' } },
              { 'screenId.name': { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      // Add sorting
      const sort: any = {};
      if (sortBy && sortOrder) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
      }

      // Add pagination
      pipeline.push({ $skip: skip }, { $limit: limit });

      // Execute aggregation pipeline
      const showDocs = await ShowModel.aggregate(pipeline).exec();

      // Count total documents using a simpler query
      const countQuery: any = {};
      if (theaterId) countQuery.theaterId = new mongoose.Types.ObjectId(theaterId);
      if (movieId) countQuery.movieId = new mongoose.Types.ObjectId(movieId);
      if (screenId) countQuery.screenId = new mongoose.Types.ObjectId(screenId);
      if (status) countQuery.status = status;

      // Handle search for count
      if (search) {
        const movieIds = await mongoose
          .model('Movie')
          .find({ name: { $regex: search, $options: 'i' } })
          .distinct('_id');
        const theaterIds = await mongoose
          .model('Theater')
          .find({ name: { $regex: search, $options: 'i' } })
          .distinct('_id');
        const screenIds = await mongoose
          .model('Screen')
          .find({ name: { $regex: search, $options: 'i' } })
          .distinct('_id');
        countQuery.$or = [
          { movieId: { $in: movieIds } },
          { theaterId: { $in: theaterIds } },
          { screenId: { $in: screenIds } },
        ];
      }

      const totalCount = await ShowModel.countDocuments(countQuery).exec();

      return {
        shows: showDocs.map((doc: any) => this.mapToEntity(doc)),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error fetching shows:', error);
      throw new CustomError('Failed to retrieve shows', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findShowsByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shows: Show[]; totalCount: number; totalPages: number }> {
    try {
      const { vendorId, page = 1, limit = 10, search, status, sortBy, sortOrder } = params;
      const skip = (page - 1) * limit;

      // Get theater IDs for the vendor
      const Theater = mongoose.model('Theater');
      const theaterIds = await Theater.find({ vendorId }).distinct('_id');

      // Build match stage for the aggregation pipeline
      const match: any = {
        theaterId: { $in: theaterIds.map((id: any) => new mongoose.Types.ObjectId(id)) },
      };
      if (status) match.status = status;

      // Aggregation pipeline for fetching shows
      const pipeline: any[] = [
        { $match: match },
        {
          $lookup: {
            from: 'movies',
            localField: 'movieId',
            foreignField: '_id',
            as: 'movieId',
          },
        },
        { $unwind: { path: '$movieId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'theaters',
            localField: 'theaterId',
            foreignField: '_id',
            as: 'theaterId',
          },
        },
        { $unwind: { path: '$theaterId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'screens',
            localField: 'screenId',
            foreignField: '_id',
            as: 'screenId',
          },
        },
        { $unwind: { path: '$screenId', preserveNullAndEmptyArrays: true } },
      ];

      // Add search criteria to the pipeline
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { 'movieId.name': { $regex: search, $options: 'i' } },
              { 'theaterId.name': { $regex: search, $options: 'i' } },
              { 'screenId.name': { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      // Add sorting
      let sort: any = { showDate: -1 }; // Default sort by showDate descending
      if (sortBy && sortOrder) {
        if (sortBy === 'movieId.name') {
          sort = { 'movieId.name': sortOrder === 'asc' ? 1 : -1 };
        } else if (sortBy === 'theaterId.name') {
          sort = { 'theaterId.name': sortOrder === 'asc' ? 1 : -1 };
        } else if (sortBy === 'showDate') {
          sort = { showDate: sortOrder === 'asc' ? 1 : -1 };
        }
      }
      pipeline.push({ $sort: sort });

      // Add pagination
      pipeline.push({ $skip: skip }, { $limit: limit });
      // Execute aggregation pipeline
      const showDocs = await ShowModel.aggregate(pipeline).exec();
      // Count total documents using a simpler query
      const countQuery: any = {
        theaterId: { $in: theaterIds.map((id: any) => new mongoose.Types.ObjectId(id)) },
      };
      if (status) countQuery.status = status;
      if (search) {
        const movieIds = await mongoose
          .model('Movie')
          .find({ name: { $regex: search, $options: 'i' } })
          .distinct('_id');
        const theaterIdsSearch = await mongoose
          .model('Theater')
          .find({ name: { $regex: search, $options: 'i' } })
          .distinct('_id');
        const screenIds = await mongoose
          .model('Screen')
          .find({ name: { $regex: search, $options: 'i' } })
          .distinct('_id');
        countQuery.$or = [
          { movieId: { $in: movieIds } },
          { theaterId: { $in: theaterIdsSearch } },
          { screenId: { $in: screenIds } },
        ];
      }

      const totalCount = await ShowModel.countDocuments(countQuery).exec();
      const totalPages = Math.ceil(totalCount / limit);

      return {
        shows: showDocs.map((doc: any) => this.mapToEntity(doc)),
        totalCount,
        totalPages,
      };
    } catch (error) {
      console.error('❌ Error fetching shows by vendor:', error);
      throw new CustomError('Failed to retrieve shows', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  private mapToEntity(doc: any): Show {
    return new Show(
      doc._id.toString(),
      doc.startTime,
      doc.movieId || doc.movieId?._id?.toString(),
      doc.theaterId || doc.theaterId?._id?.toString(),
      doc.screenId || doc.screenId?._id?.toString(),
      doc.vendorId || doc.vendorId?._id?.toString(),
      doc.status,
      doc.bookedSeats?.map((seat: any) => ({
        date: seat.date,
        isPending: seat.isPending,
        seatNumber: seat.seatNumber,
        seatPrice: seat.seatPrice,
        type: seat.type,
        position: seat.position,
        userId: seat.userId?._id?.toString() || seat.userId,
      })) || [],
      doc.endTime,
      doc.showDate, // Add showDate
    );
  }

  async findShowSelection(params: {
    movieId: string;
    latitude: number;
    longitude: number;
    selectedLocation: string;
    date: string;
    priceRanges?: { min: number; max: number }[];
    timeSlots?: { start: string; end: string }[];
    facilities?: string[];
  }): Promise<ShowSelectionResponseDTO> {
    try {
      const {
        movieId,
        latitude,
        longitude,
        selectedLocation,
        date,
        priceRanges,
        timeSlots,
        facilities,
      } = params;

      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new CustomError('Invalid latitude or longitude values', HttpResCode.BAD_REQUEST);
      }

      // Validate movieId
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new CustomError('Invalid movie ID', HttpResCode.BAD_REQUEST);
      }

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new CustomError('Invalid date format', HttpResCode.BAD_REQUEST);
      }

      // Step 1: Find theaters within 25km or by city
      let theaterIds: string[] = [];
      try {
        const theatersWithinRadius = await TheaterModel.find({
          'location.type': 'Point',
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [latitude, longitude],
              },
              $maxDistance: 25000,
            },
          },
        })
          .select('_id')
          .lean();
        theaterIds = theatersWithinRadius.map((theater) => theater._id.toString());
      } catch (geoError) {
        console.error('Geospatial query failed:', geoError);
      }

      // Fallback to city-based search
      if (theaterIds.length === 0) {
        let cityQuery = selectedLocation;
        if (['kozhikode', 'calicut'].includes(selectedLocation.toLowerCase())) {
          cityQuery = '(Kozhikode|Calicut)';
        }
        const theatersInCity = await TheaterModel.find({
          'location.city': { $regex: cityQuery, $options: 'i' },
        })
          .select('_id')
          .lean();
        theaterIds = theatersInCity.map((theater) => theater._id.toString());
      }

      if (theaterIds.length === 0) {
        return {
          movie: null,
          theaters: [],
        };
      }

      // Step 2: Build show query
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      const showQuery: any = {
        movieId: new mongoose.Types.ObjectId(movieId),
        theaterId: { $in: theaterIds.map((id) => new mongoose.Types.ObjectId(id)) },
        showDate: { $gte: startOfDay, $lte: endOfDay }, // Filter for specific date
        status: { $in: ['Scheduled', 'Running'] },
      };

      // Step 3: Apply filters
      if (facilities && facilities.length > 0) {
        const facilityQuery: any = {};
        facilities.forEach((facility) => {
          facilityQuery[`facilities.${facility}`] = true;
        });
        const filteredTheaterIds = await TheaterModel.find(facilityQuery)
          .select('_id')
          .lean()
          .then((theaters) => theaters.map((t) => t._id.toString()));
        showQuery.theaterId = {
          $in: filteredTheaterIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      if (timeSlots && timeSlots.length > 0) {
        const timeConditions = timeSlots.map((slot) => ({
          startTime: {
            $gte: new Date(`${date}T${slot.start}:00.000Z`),
            $lte: new Date(`${date}T${slot.end}:59.999Z`),
          },
        }));
        showQuery.$or = timeConditions;
      }

      if (priceRanges && priceRanges.length > 0) {
        const priceConditions = priceRanges.map((range) => ({
          $or: [
            { 'seatPrice.regular': { $gte: range.min, $lte: range.max } },
            { 'seatPrice.premium': { $gte: range.min, $lte: range.max } },
            { 'seatPrice.vip': { $gte: range.min, $lte: range.max } },
          ],
        }));
        const seatLayoutIds = await seatLayoutModel
          .find({
            $or: priceConditions,
          })
          .select('_id')
          .lean()
          .then((seatLayouts) => seatLayouts.map((sl) => sl._id.toString()));

        const screenIds = await ScreenModel.find({
          seatLayoutId: { $in: seatLayoutIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
          .select('_id')
          .lean()
          .then((screens) => screens.map((s) => s._id.toString()));

        showQuery.screenId = { $in: screenIds.map((id) => new mongoose.Types.ObjectId(id)) };
      }

      // Step 4: Fetch shows with populated data
      const pipeline = [
        { $match: showQuery },
        {
          $lookup: {
            from: 'movies',
            localField: 'movieId',
            foreignField: '_id',
            as: 'movieId',
          },
        },
        { $unwind: { path: '$movieId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'theaters',
            localField: 'theaterId',
            foreignField: '_id',
            as: 'theaterId',
          },
        },
        { $unwind: { path: '$theaterId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'screens',
            localField: 'screenId',
            foreignField: '_id',
            as: 'screenId',
          },
        },
        { $unwind: { path: '$screenId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'seatlayouts',
            localField: 'screenId.seatLayoutId',
            foreignField: '_id',
            as: 'seatLayout',
          },
        },
        { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: true } },
      ];

      const showDocs = await ShowModel.aggregate(pipeline).exec();

      // Step 5: Fetch movie details
      const movieDoc = await MovieModel.findById(movieId)
        .select('name language genre rating duration')
        .lean();

      if (!movieDoc) {
        throw new CustomError('Movie not found', HttpResCode.NOT_FOUND);
      }

      // Step 6: Group shows by theater and calculate seat status
      const theaterMap = new Map<string, ShowSelectionTheaterDTO>();
      for (const show of showDocs) {
        const theaterId = show.theaterId?._id?.toString();
        if (!theaterId) continue;

        const bookedSeats = show.bookedSeats?.length || 0;
        const capacity = show.seatLayout?.capacity || 1;
        const fillPercentage = (bookedSeats / capacity) * 100;
        let status: 'available' | 'fast-filling' | 'not-available';
        if (fillPercentage >= 100) {
          status = 'not-available';
        } else if (fillPercentage > 40) {
          status = 'fast-filling';
        } else {
          status = 'available';
        }

        const showTime = show.startTime;

        if (!theaterMap.has(theaterId)) {
          theaterMap.set(theaterId, {
            id: theaterId,
            name: show.theaterId?.name || 'Unknown Theater',
            rating: show.theaterId?.rating || 0,
            facilities: show.theaterId?.facilities || {
              foodCourt: false,
              lounges: false,
              mTicket: false,
              parking: false,
              freeCancellation: false,
            },
            images: show.theaterId?.gallery || [],
            address: {
              city: show.theaterId?.location?.city || '',
              coordinates: show.theaterId?.location?.coordinates || [0, 0],
            },
            shows: [],
          });
        }

        theaterMap.get(theaterId)!.shows.push({
          time: showTime,
          status,
          _id: show._id,
          amenities: show.screenId.amenities,
        });
      }

      // Step 7: Map movie details
      const movieDTO: ShowSelectionMovieDTO = {
        title: movieDoc.name,
        language: movieDoc.language,
        genres: movieDoc.genre,
        duration: `${movieDoc.duration.hours}h ${movieDoc.duration.minutes}m`,
        rating: movieDoc.rating,
      };

      return {
        movie: movieDTO,
        theaters: Array.from(theaterMap.values()),
      };
    } catch (error) {
      console.error('❌ Error fetching show selection:', error);
      throw new CustomError(
        error instanceof CustomError ? error.message : 'Failed to retrieve show selection',
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateBookedSeats(
    showId: string,
    bookedSeats: {
      date: Date;
      isPending: boolean;
      seatNumber: string;
      seatPrice: number;
      type: string;
      position: { row: number; col: number };
      userId: string;
    }[],
  ): Promise<Show> {
    try {
      const updatedShow = await ShowModel.findByIdAndUpdate(
        showId,
        { $push: { bookedSeats: { $each: bookedSeats } } },
        { new: true },
      )
        .populate('movieId', 'name duration')
        .populate('theaterId', 'name intervalTime')
        .populate('screenId', 'name')
        .lean();

      if (!updatedShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      return this.mapToEntity(updatedShow);
    } catch (error) {
      console.error('❌ Error updating booked seats:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pullExpiredSeats(showId: string): Promise<void> {
    try {
      const expirationTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      const result = await ShowModel.findByIdAndUpdate(
        showId,
        {
          $pull: {
            bookedSeats: { isPending: true, date: { $lt: expirationTime } },
          },
        },
        { new: true },
      ).lean();

      if (!result) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      console.log(`✅ Removed expired pending seats from showId: ${showId}`);
    } catch (error) {
      console.error('❌ Error pulling expired pending seats:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async confirmBookedSeats(showId: string, seatNumbers: string[]): Promise<Show> {
    try {
      const updatedShow = await ShowModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(showId) }, // ensure it's cast correctly
        {
          $set: {
            'bookedSeats.$[seat].isPending': false,
          },
        },
        {
          new: true,
          arrayFilters: [{ 'seat.seatNumber': { $in: seatNumbers }, 'seat.isPending': true }],
        },
      )
        .populate('movieId', 'name duration')
        .populate('theaterId', 'name intervalTime')
        .populate('screenId', 'name')
        .lean();

      if (!updatedShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      return this.mapToEntity(updatedShow);
    } catch (error) {
      console.error('❌ Error confirming booked seats:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_UPDATED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByIdSession(id: string, session?: mongoose.ClientSession): Promise<Show | null> {
    try {
      const query = ShowModel.findById(id).populate('movieId theaterId screenId');
      if (session) {
        query.session(session);
      }
      const showDoc = await query.lean();
      if (!showDoc) return null;
      // Map to Show entity
      return this.mapToEntity(showDoc);
    } catch (error) {
      console.error('❌ Error finding show:', error);
      throw new Error('Failed to find show');
    }
  }

  async updateBookedSeatsSession(
    showId: string,
    bookedSeats: any[],
    session?: mongoose.ClientSession,
  ): Promise<void> {
    try {
      const updateQuery = ShowModel.findByIdAndUpdate(
        showId,
        { $push: { bookedSeats: { $each: bookedSeats } } },
        { new: true },
      );
      if (session) {
        updateQuery.session(session);
      }
      await updateQuery;
    } catch (error) {
      console.error('❌ Error updating booked seats:', error);
      throw new Error('Failed to update booked seats');
    }
  }

  async creditRevenueToWallet(showId: string): Promise<number> {
    try {
      const show = await ShowModel.findById(showId).lean();
      if (!show) {
        console.warn(`⚠️ Show with ID ${showId} not found`);
        return 0;
      }

      const completedBookings = await BookingModel.find({
        showId: new mongoose.Types.ObjectId(showId),
        status: 'confirmed',
        'payment.status': 'completed',
      }).lean();

      if (!completedBookings.length) {
        console.log(`🟡 No completed bookings for show ${showId}`);
        return 0;
      }

      const totalRevenue = completedBookings.reduce(
        (sum: number, booking: IBooking) => sum + booking.payment.amount,
        0,
      );

      if (totalRevenue <= 0) {
        console.log(`🟡 Total revenue is 0 for show ${showId}`);
        return 0;
      }

      const ADMIN_COMMISSION_RATE = 0.15;
      const adminCommission = parseFloat((totalRevenue * ADMIN_COMMISSION_RATE).toFixed(2));
      const vendorShare = parseFloat((totalRevenue - adminCommission).toFixed(2));

      const targetUserId = process.env.ADMIN_USER_ID || '681a66250869b998bbad2545';

      const adminTransaction = {
        amount: adminCommission,
        type: 'credit' as const,
        source: 'booking' as const,
        createdAt: new Date(),
        remark: `Admin commission of ₹${adminCommission} from show ${showId}`,
      };

      const vendorTransaction = {
        amount: vendorShare,
        type: 'credit' as const,
        source: 'booking' as const,
        createdAt: new Date(),
        remark: `Vendor payout of ₹${vendorShare} from show ${showId} after admin commission 15%`,
      };

      const updatedAdminWallet = await this.walletRepository.pushTransactionAndUpdateBalance(
        targetUserId,
        adminTransaction,
      );

      const updatedVendorWallet = await this.walletRepository.pushTransactionAndUpdateBalance(
        show.vendorId.toString(),
        vendorTransaction,
      );

      if (!updatedAdminWallet || !updatedVendorWallet) {
        throw new Error(`Wallet update failed (Admin: ${targetUserId}, Vendor: ${show.vendorId})`);
      }

      console.log(
        `✅ ₹${adminCommission} credited to Admin and ₹${vendorShare} credited to Vendor for show ${showId}`,
      );
      return totalRevenue;
    } catch (error) {
      console.error(`❌ Error in creditRevenueToWallet for show ${showId}:`, error);
      throw error;
    }
  }
}
