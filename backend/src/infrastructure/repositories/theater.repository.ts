import { Theater } from '../../domain/entities/theater.entity';
import { ITheaterRepository } from '../../domain/interfaces/repositories/theater.repository';
import { TheaterModel } from '../database/theater.model'
import { ITheater } from '../../domain/interfaces/thaeter.interface';
import { ObjectId } from 'mongoose';

export class TheaterRepository implements ITheaterRepository {
  // Create a new Theater in the database
  async create(theater: Theater): Promise<Theater> {
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
      password: theater.description,
      rating: theater.rating,
    };
    console.log("🚀 ~ TheaterRepository ~ create ~ theaterData:", theaterData);

    const newTheater = new TheaterModel(theaterData);
    const savedTheater = await newTheater.save();

    return this.mapToEntity(savedTheater);
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
        password: theater.description,
        rating: theater.rating,
      },
      { new: true },
    );
    if (!updatedTheater) throw new Error('Theater not found');
    return this.mapToEntity(updatedTheater);
  }

  async findTheaters(): Promise<Theater[]> {
    const theaterDocs = await TheaterModel.find({ accountType: 'theater' });
    return theaterDocs.map((doc) => this.mapToEntity(doc));
  }

  async findEvents(): Promise<Theater[]> {
    const theaterDocs = await TheaterModel.find({ accountType: 'event' });
    return theaterDocs.map((doc) => this.mapToEntity(doc));
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
      doc.rating,
    );
  }
}
