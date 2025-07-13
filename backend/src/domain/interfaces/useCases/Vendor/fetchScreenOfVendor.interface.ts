export interface IFetchScreensOfVendorUseCase {
  execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ screens: any[]; totalCount: number }>;
}
