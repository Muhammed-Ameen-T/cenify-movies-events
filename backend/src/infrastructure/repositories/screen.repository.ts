import mongoose from 'mongoose';
import { Screen } from '../../domain/entities/screen.entity';
import { IScreenRepository } from '../../domain/interfaces/repositories/screen.repository';
import ScreenModel from '../database/screen.model';
import { IScreen } from '../../domain/interfaces/model/screen.interface';
import { TheaterModel } from '../database/theater.model';
import SeatLayoutModel from '../database/seatLayout.model';

export class ScreenRepository implements IScreenRepository {
  async create(screen: Screen): Promise<Screen> {
    try {
      const screenData = {
        name: screen.name,
        theaterId: screen.theaterId,
        seatLayoutId: screen.seatLayoutId,
        filledTimes:
          screen.filledTimes?.map((time) => ({
            startTime: time.startTime,
            endTime: time.endTime,
            showId: time.showId,
          })) || [],
        amenities: screen.amenities || {
          is3D: false,
          is4K: false,
          isDolby: false,
        },
      };

      const newScreen = new ScreenModel(screenData);
      const savedScreen = await newScreen.save();

      const mappedScreen = this.mapToEntity(savedScreen);
      if (!mappedScreen) throw new Error('Error mapping screen entity');
      return mappedScreen;
    } catch (error) {
      console.error('❌ Error creating screen:', error);
      throw new Error('Error creating screen');
    }
  }

  async findById(id: string): Promise<Screen | null> {
    try {
      const screenDoc = await ScreenModel.findById(id)
        .populate({ path: 'theaterId', model: 'Theater' }) // Populate all theater fields
        .populate({ path: 'seatLayoutId', model: 'SeatLayout' }) // Populate all seat layout fields
        .lean();
      if (!screenDoc) return null;
      return this.mapToEntity(screenDoc);
    } catch (error) {
      console.error('❌ Error finding screen by ID:', error);
      throw new Error('Failed to find screen');
    }
  }

  async findScreenByName(
    name: string,
    theaterId: string,
    screenId: string,
  ): Promise<Screen | null> {
    try {
      const screenDoc = await ScreenModel.findOne({
        name,
        theaterId,
        _id: { $ne: screenId },
      })
        .populate({ path: 'theaterId', model: 'Theater' })
        .populate({ path: 'seatLayoutId', model: 'SeatLayout' })
        .lean();

      if (!screenDoc) return null;
      return this.mapToEntity(screenDoc);
    } catch (error) {
      console.error('❌ Error finding screen:', error);
      throw new Error('Failed to find screen');
    }
  }

  async updateScreenDetails(screen: Screen): Promise<Screen> {
    try {
      const updatedScreen = await ScreenModel.findByIdAndUpdate(
        screen._id,
        {
          name: screen.name,
          theaterId:
            typeof screen.theaterId === 'string'
              ? screen.theaterId
              : (screen.theaterId?._id ?? null),
          seatLayoutId:
            typeof screen.seatLayoutId === 'string'
              ? screen.seatLayoutId
              : (screen.seatLayoutId?.['_id'] ?? null),
          filledTimes: screen.filledTimes?.map((time) => ({
            startTime: time.startTime,
            endTime: time.endTime,
            showId: time.showId,
          })),
          amenities: screen.amenities,
        },
        { new: true },
      )
        .populate({ path: 'theaterId', model: 'Theater' })
        .populate({ path: 'seatLayoutId', model: 'SeatLayout' })
        .lean();

      if (!updatedScreen) throw new Error('Screen not found');
      return this.mapToEntity(updatedScreen);
    } catch (error) {
      console.error('❌ Error updating screen:', error);
      throw new Error('Failed to update screen');
    }
  }

  async findScreensByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ screens: Screen[]; totalCount: number }> {
    try {
      const { vendorId, page = 1, limit = 8, search, theaterId, sortBy, sortOrder } = params;
      const skip = (page - 1) * limit;

      let Theater;
      try {
        Theater = mongoose.model('Theater');
      } catch (error) {
        console.error('❌ Theaters model not registered:', error);
        throw new Error('Theaters model not registered. Please ensure it is initialized.');
      }

      const theaterIds = await Theater.find({ vendorId }).distinct('_id');

      const query: any = {
        theaterId: { $in: theaterIds },
      };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } }, // Search screen name
          {
            theaterId: {
              $in: await Theater.find({ name: { $regex: search, $options: 'i' } }).distinct('_id'),
            },
          }, // Search theater name
        ];
      }

      if (theaterId) {
        query.theaterId = theaterId;
      }

      const sort: any = {};
      if (sortBy && sortOrder) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      const screenDocs = await ScreenModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'theaterId',
          model: 'Theater', // Explicitly specify model name
        })
        .populate({
          path: 'seatLayoutId',
        })
        .lean();

      const totalCount = await ScreenModel.countDocuments(query);

      return {
        screens: screenDocs.map((doc: any) => this.mapToEntity(doc)),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error fetching screens:', error);
      throw new Error('Failed to retrieve screens: Please try again later.');
    }
  }

  async checkSlot(
    screenId: string,
    startTime: Date,
    endTime: Date,
    excludeShowId?: string,
  ): Promise<boolean> {
    try {
      const query: any = {
        _id: screenId,
        filledTimes: {
          $elemMatch: {
            $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
          },
        },
      };

      if (excludeShowId) {
        query.filledTimes.$elemMatch.showId = { $ne: new mongoose.Types.ObjectId(excludeShowId) };
      }

      const existingShow = await ScreenModel.findOne(query).lean();
      return !existingShow; // Returns true if slot is available, false if there's a conflict
    } catch (error) {
      console.error('❌ Error checking slot availability:', error);
      throw new Error('Failed to check slot availability');
    }
  }

  private mapToEntity(doc: any): Screen {
    return new Screen(
      doc._id.toString(),
      doc.name,
      doc.theaterId || doc.theaterId?._id?.toString(),
      doc.seatLayoutId || doc.seatLayoutId?._id?.toString(),
      doc.filledTimes?.map((time: any) => ({
        startTime: time.startTime,
        endTime: time.endTime,
        showId: time.showId,
      })) || [],
      doc.amenities || {
        is3D: false,
        is4K: false,
        isDolby: false,
      },
    );
  }

  async findByIdSession(id: string, session?: mongoose.ClientSession): Promise<Screen | null> {
    try {
      const query = ScreenModel.findById(id)
        .populate({ path: 'theaterId', model: 'Theater' })
        .populate({ path: 'seatLayoutId', model: 'SeatLayout' })
        .lean();

      if (session) {
        query.session(session);
      }

      const screenDoc = await query;

      if (!screenDoc) return null;

      return this.mapToEntity(screenDoc);
    } catch (error) {
      console.error('❌ Error finding screen by ID:', error);
      throw new Error('Failed to find screen');
    }
  }
}
