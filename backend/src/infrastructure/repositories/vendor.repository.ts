import { Vendor } from '../../domain/entities/vendor.entity';
import { IVendorRepository } from '../../domain/interfaces/repositories/vendor.repository';
import { VendorModel } from '../database/vendor.model';
import { IVendor } from '../../domain/interfaces/vendor.interface';

export class VendorRepository implements IVendorRepository {
  // Create a new Vendor in the database
  async create(vendor: Vendor): Promise<Vendor> {
    const vendorData = {
      screens: vendor.screens,
      name: vendor.name,
      status: vendor.status,
      location: vendor.location
        ? {
            city: vendor.location.city,
            coordinates: vendor.location.coordinates,
            type: vendor.location.type,
          }
        : null,
      facilities: vendor.facilities,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      intervalTime: vendor.intervalTime,
      gallery: vendor.gallery,
      email: vendor.email,
      phone: vendor.phone,
      password: vendor.password,
      rating: vendor.rating,
      accountType: vendor.accountType,
    };
    console.log("🚀 ~ VendorRepository ~ create ~ vendorData:", vendorData)

    const newVendor = new VendorModel(vendorData);
    const savedVendor = await newVendor.save();

    return this.mapToEntity(savedVendor);
  }

  // Find a vendor by ID
  async findById(id: string): Promise<Vendor | null> {
    const vendorDoc = await VendorModel.findById(id);
    if (!vendorDoc) return null;
    return this.mapToEntity(vendorDoc);
  }

  // Find a vendor by email
  async findByEmail(email: string): Promise<Vendor | null> {
    const vendorDoc = await VendorModel.findOne({ email });
    if (!vendorDoc) return null;
    return this.mapToEntity(vendorDoc);
  }

  // Update vendor verification status
  async updateVerificationStatus(id: string, vendor: Vendor): Promise<Vendor> {
    const vendorDoc =  await VendorModel.findByIdAndUpdate(id, vendor, { new: true }).exec();
    if (!vendorDoc) throw new Error('Vendor not found');
    return this.mapToEntity(vendorDoc);
  }

  // Update vendor details
  async updateVendorDetails(vendor: Vendor): Promise<Vendor> {
    const vendorDoc = await VendorModel.findByIdAndUpdate(
      vendor._id,
      {
        screens: vendor.screens,
        name: vendor.name,
        status: vendor.status,
        location: vendor.location
          ? {
              city: vendor.location.city,
              coordinates: vendor.location.coordinates,
              type: vendor.location.type,
            }
          : null,
        facilities: vendor.facilities,
        updatedAt: vendor.updatedAt,
        intervalTime: vendor.intervalTime,
        gallery: vendor.gallery,
        email: vendor.email,
        phone: vendor.phone,
        password: vendor.password,
        rating: vendor.rating,
        accountType: vendor.accountType,
      },
      { new: true },
    );
    if (!vendorDoc) throw new Error('Vendor not found');
    return this.mapToEntity(vendorDoc);
  }

  async findTheaters(): Promise<Vendor[]> {
    const theaterDocs = await VendorModel.find({ accountType: 'theater' });
    return theaterDocs.map((doc) => this.mapToEntity(doc));
  }

  async findEvents(): Promise<Vendor[]> {
    const theaterDocs = await VendorModel.find({ accountType: 'event' });
    return theaterDocs.map((doc) => this.mapToEntity(doc));
  }

  private mapToEntity(doc: IVendor): Vendor {
    return new Vendor(
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
      doc.password,
      doc.rating,
      doc.accountType,
    );
  }
}
