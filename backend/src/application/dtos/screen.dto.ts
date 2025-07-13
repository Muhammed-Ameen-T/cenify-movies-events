export interface CreateScreenDTO {
  name: string;
  theaterId: string;
  seatLayoutId: string;
  amenities: {
    is3D: boolean;
    is4K: boolean;
    isDolby: boolean;
  };
}

export interface UpdateScreenDTO {
  name?: string;
  theaterId?: string;
  seatLayoutId?: string;
  amenities: {
    is3D: boolean;
    is4K: boolean;
    isDolby: boolean;
  };
}
