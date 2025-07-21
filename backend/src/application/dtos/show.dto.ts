export interface CreateShowDTO {
  theaterId: string;
  screenId: string;
  movieId: string;
  date: string;
  showTimes: {
    startTime: string;
    endTime: string;
  }[];
}

export interface UpdateShowDTO {
  id: string;
  theaterId?: string;
  screenId?: string;
  movieId?: string;
  showDate?: string;
  startTime?: string;
  endTime?: string;
}
export interface UpdateShowStatusDTO {
  id: string;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled';
}

export interface ShowSelectionTheaterDTO {
  id: string;
  name: string;
  rating: number;
  facilities: {
    foodCourt: boolean;
    lounges: boolean;
    mTicket: boolean;
    parking: boolean;
    freeCancellation: boolean;
  };
  images: string[];
  address: {
    city: string;
    coordinates: [number, number];
  };
  shows: {
    time: string;
    status: 'available' | 'fast-filling' | 'not-available';
    _id: string;
    amenities: any;
  }[];
}

export interface ShowSelectionMovieDTO {
  title: string;
  language: string;
  genres: string[];
  duration: string;
  rating: number;
}

export interface ShowSelectionResponseDTO {
  movie: ShowSelectionMovieDTO | null;
  theaters: ShowSelectionTheaterDTO[];
}
