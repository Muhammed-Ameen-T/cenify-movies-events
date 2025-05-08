import { Theater } from '../../domain/entities/theater.entity';
import { ITheaterRepository } from '../../domain/interfaces/repositories/theater.repository';
import { TheaterModel } from '../database/theater.model'
import { ITheater } from '../../domain/interfaces/thaeter.interface';
import { ObjectId } from 'mongoose';

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
  
      console.log("🚀 ~ TheaterRepository ~ create ~ theaterData:", theaterData);
  
      const newTheater = new TheaterModel(theaterData);
      const savedTheater = await newTheater.save();
  
      const mappedTheater = this.mapToEntity(savedTheater);
      if (!mappedTheater) throw new Error('Error mapping theater entity');
      return mappedTheater;
    } catch (error) {
      console.error("❌ Error creating theater:", error);
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
        vendorId : theater.vendorId,
        rating: theater.rating,
      },
      { new: true },
    );
    if (!updatedTheater) throw new Error('Theater not found');
    return this.mapToEntity(updatedTheater);
  }

  async findTheaters(): Promise<Theater[]> {
    try {
      const theaterDocs =  await TheaterModel.find() 
      .populate({
        path: "vendorId",
        select: "name email phone",
        model: "User" 
      })
      .lean();
      console.log("🚀 ~ TheaterRepository ~ findTheaters ~ theaterDocs:", theaterDocs)
      return theaterDocs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      console.error("Error fetching theaters:", error); // Log the error for debugging
      throw new Error("Failed to retrieve theaters. Please try again later."); // Provide a meaningful error message
    }
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
      doc.vendorId,
      doc.rating,
    );
  }
}
