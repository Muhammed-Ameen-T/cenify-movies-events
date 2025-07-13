import { Theater } from '../../domain/entities/theater.entity';
import { ITheaterRepository } from '../../domain/interfaces/repositories/theater.repository';
import { TheaterModel } from '../database/theater.model';
import { ITheater } from '../../domain/interfaces/model/thaeter.interface';
import mongoose, { ObjectId } from 'mongoose';
import { FetchTheatersParams } from '../../domain/types/theater';

export class TheaterRepository implements ITheaterRepository {
  // Create a new Theater in the database
  async create(theater: Theater): Promise<Theater> {
    try {
      const theaterData = {
        screens: theater.screens,
        name: theater.name,
        status: theater.status,
        location: theater.location
          ? {
              city: theater.location.city,
              coordinates: theater.location.coordinates,
              type: theater.location.type,
            }
          : null,
        facilities: theater.facilities,
        createdAt: theater.createdAt,
        updatedAt: theater.updatedAt,
        intervalTime: theater.intervalTime,
        gallery: theater.gallery,
        email: theater.email,
        phone: theater.phone,
        description: theater.description,
        vendorId: theater.vendorId,
        rating: theater.rating,
      };


      const newTheater = new TheaterModel(theaterData);
      const savedTheater = await newTheater.save();

      const mappedTheater = this.mapToEntity(savedTheater);
      if (!mappedTheater) throw new Error('Error mapping theater entity');
      return mappedTheater;
    } catch (error) {
      console.error('❌ Error creating theater:', error);
      throw new Error('Error creating theater'); // Throw an error to ensure a Theater object is always returned
    }
  }

  // Find a theater by ID
  async findById(id: string): Promise<Theater | null> {
    const theaterDoc = await TheaterModel.findById(id);
    if (!theaterDoc) return null;
    return this.mapToEntity(theaterDoc);
  }

  // Find a theater by email
  async findByEmail(email: string): Promise<Theater | null> {
    const theaterDoc = await TheaterModel.findOne({ email });
    if (!theaterDoc) return null;
    return this.mapToEntity(theaterDoc);
  }

  // Update theater verification status
  async updateVerificationStatus(id: string, theater: Theater): Promise<Theater> {
    const theaterDoc = await TheaterModel.findByIdAndUpdate(id, theater, { new: true }).exec();
    if (!theaterDoc) throw new Error('Theater not found');
    return this.mapToEntity(theaterDoc);
  }

  // Update theater details
  async updateTheaterDetails(theater: Theater): Promise<Theater> {
    const updatedTheater = await TheaterModel.findByIdAndUpdate(
      theater._id,
      {
        screens: theater.screens,
        name: theater.name,
        status: theater.status,
        location: theater.location
          ? {
              city: theater.location.city,
              coordinates: theater.location.coordinates,
              type: theater.location.type,
            }
          : null,
        facilities: theater.facilities,
        updatedAt: theater.updatedAt,
        intervalTime: theater.intervalTime,
        gallery: theater.gallery,
        email: theater.email,
        phone: theater.phone,
        description: theater.description,
        vendorId: theater.vendorId,
        rating: theater.rating,
      },
      { new: true },
    );
    if (!updatedTheater) throw new Error('Theater not found');
    return this.mapToEntity(updatedTheater);
  }

  async findTheaters(): Promise<Theater[]> {
    try {
      const theaterDocs = await TheaterModel.find()
        .populate({
          path: 'vendorId',
          select: 'name email phone',
          model: 'User',
        })
        .lean();
      return theaterDocs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      console.error('Error fetching theaters:', error); // Log the error for debugging
      throw new Error('Failed to retrieve theaters. Please try again later.'); // Provide a meaningful error message
    }
  }

  async findEvents(): Promise<Theater[]> {
    const theaterDocs = await TheaterModel.find({ accountType: 'event' });
    return theaterDocs.map((doc) => this.mapToEntity(doc));
  }

  async updateScreens(
    theaterId: string,
    screenId: string,
    action: 'push' | 'pull',
  ): Promise<Theater | null> {
    try {
      const updateQuery =
        action === 'push' ? { $addToSet: { screens: screenId } } : { $pull: { screens: screenId } };

      const updatedTheater = await TheaterModel.findByIdAndUpdate(theaterId, updateQuery, {
        new: true,
      }).lean();

      if (!updatedTheater) throw new Error('Theater not found');

      return this.mapToEntity(updatedTheater);
    } catch (error) {
      console.error(`❌ Error ${action === 'push' ? 'adding' : 'removing'} screen:`, error);
      throw new Error(`Failed to ${action === 'push' ? 'add' : 'remove'} screen from theater`);
    }
  }

  async findTheatersByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ theaters: Theater[]; totalCount: number }> {
    try {
      const { vendorId, page = 1, limit = 8, search, status, location, sortBy, sortOrder } = params;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = { vendorId };

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      if (status && status.length > 0) {
        query.status = { $in: status };
      }

      if (location) {
        query['location.city'] = { $regex: location, $options: 'i' };
      }

      // Build sorting options
      const sort: any = {};
      if (sortBy && sortOrder) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      // Fetch theaters with pagination and filters
      const theaterDocs = await TheaterModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'vendorId',
          select: 'name email phone',
          model: 'User',
        })
        .lean();

      // Count total documents matching the query
      const totalCount = await TheaterModel.countDocuments(query);

      return {
        theaters: theaterDocs.map((doc) => this.mapToEntity(doc)),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error fetching theaters:', error);
      throw new Error('Failed to retrieve theaters: Please try again later.');
    }
  }

  async addRating(theaterId: string, newRating: number): Promise<Theater> {
    try {
      const theaterDoc = await TheaterModel.findById(theaterId).exec();
      if (!theaterDoc) {
        throw new Error('Theater not found');
      }

      // Calculate new average rating
      const currentTotal = theaterDoc.rating ? theaterDoc.rating : 0 * theaterDoc.ratingCount;
      const updatedRatingCount = theaterDoc.ratingCount + 1;
      const updatedAverage = (currentTotal + newRating) / updatedRatingCount;

      theaterDoc.ratingCount = updatedRatingCount;
      theaterDoc.rating = Number(updatedAverage.toFixed(1)); // Optional: round to 1 decimal
      theaterDoc.updatedAt = new Date();

      const savedDoc = await theaterDoc.save();
      return this.mapToEntity(savedDoc);
    } catch (error) {
      console.error('❌ Error updating theater rating:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to update rating: ${error.message}`
          : 'Failed to update rating',
      );
    }
  }

  async findAdminTheaters(params: FetchTheatersParams = {}): Promise<{
    theaters: Theater[];
    totalCount: number;
  }> {
    try {
      const {
        page = 1,
        limit = 6,
        search,
        status,
        features,
        rating,
        location,
        sortBy,
        sortOrder,
      } = params;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
        ];
      }

      if (status && status.length > 0) {
        query.status = { $in: status };
      }

      if (features && features.length > 0) {
        const facilityKeys = features.map((feature: any) =>
          feature === 'Food Court'
            ? 'foodCourt'
            : feature === 'Lounges'
              ? 'lounges'
              : feature === 'Mobile Ticket'
                ? 'mTicket'
                : feature === 'Parking'
                  ? 'parking'
                  : 'freeCancellation',
        );
        query.$or = facilityKeys.map((key: any) => ({ [`facilities.${key}`]: true }));
      }

      if (rating) {
        query.rating = { $gte: rating };
      }

      if (location) {
        query['location.city'] = { $regex: location, $options: 'i' };
      }

      // Build sorting options
      const sort: any = {};
      if (sortBy && sortOrder) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1; // Default to newest first
      }

      // Fetch theaters with pagination and filters
      const theaterDocs = await TheaterModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'vendorId',
          select: 'name email phone',
          model: 'User',
        })
        .lean();

      // Count total documents matching the query
      const totalCount = await TheaterModel.countDocuments(query);

      return {
        theaters: theaterDocs.map((doc) => this.mapToEntity(doc)),
        totalCount,
      };
    } catch (error) {
      console.error('Error fetching theaters:', error);
      throw new Error('Failed to retrieve theaters');
    }
  }

  private mapToEntity(doc: ITheater): Theater {
    return new Theater(
      doc._id,
      doc.screens?.map((id) => id.toString()) || null,
      doc.name,
      doc.status,
      doc.location
        ? {
            city: doc.location.city,
            coordinates: doc.location.coordinates || null,
            type: doc.location.type || null,
          }
        : null,
      doc.facilities || {
        foodCourt: null,
        lounges: null,
        mTicket: null,
        parking: null,
        freeCancellation: null,
      },
      doc.createdAt,
      doc.updatedAt,
      doc.intervalTime,
      doc.gallery,
      doc.email,
      doc.phone,
      doc.description,
      doc.vendorId,
      doc.rating,
      doc.ratingCount,
    );
  }
}
