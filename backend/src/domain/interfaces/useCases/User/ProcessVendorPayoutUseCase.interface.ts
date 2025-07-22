export interface IProcessVendorPayout {
  execute(): Promise<{ vendorId: string; gross: number; net: number }[]>;
}
