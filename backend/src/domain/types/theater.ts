export interface FetchTheatersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  features?: string[];
  rating?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
