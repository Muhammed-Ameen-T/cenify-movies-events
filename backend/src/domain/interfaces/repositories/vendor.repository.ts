import { Vendor } from '../../entities/vendor.entity';

export interface IVendorRepository {
  create(Vendor: Vendor): Promise<Vendor>;
  findById(id: string): Promise<Vendor | null>;
  findByEmail(email: string): Promise<Vendor | null>;
  updateVerificationStatus(id: string, vendor: Vendor): Promise<Vendor>;
  updateVendorDetails(Vendor: Vendor): Promise<Vendor>;
  findTheaters(): Promise<Vendor[]>; // New method
  findEvents(): Promise<Vendor[]>; // New method
}
