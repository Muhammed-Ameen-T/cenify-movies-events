import { UserProfile, Booking, Notification } from '../types';

// Mock Data
export const mockUser: UserProfile = {
  name: "Emma Thompson",
  email: "emma.t@example.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1992-05-15",
  joinedDate: "2023-02-10",
  loyaltyPoints: 1250,
  profileImage: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
};

export const mockBookings: Booking[] = [
  {
      id: "b1",
      movieTitle: "Inception 2: Dream Deeper",
      date: "2025-05-20",
      time: "18:30",
      theater: "Grand Cinema - Hall 3",
      seats: ["F12", "F13"],
      poster: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg",
      upcoming: true,
      userId: '',
      userName: '',
      showId: '',
      showTitle: '',
      theaterId: '',
      theaterName: '',
      totalAmount: 0,
      status: 'cancelled',
      bookedAt: ''
  },
  {
      id: "b2",
      movieTitle: "Eternal Sunshine",
      date: "2025-05-05",
      time: "20:00",
      theater: "Royal Theater - Hall 1",
      seats: ["C5", "C6", "C7"],
      poster: "https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg",
      upcoming: false,
      userId: '',
      userName: '',
      showId: '',
      showTitle: '',
      theaterId: '',
      theaterName: '',
      totalAmount: 0,
      status: 'cancelled',
      bookedAt: ''
  },
  {
      id: "b3",
      movieTitle: "Space Odyssey: New Beginnings",
      date: "2025-04-28",
      time: "19:15",
      theater: "Stellar Cinema - IMAX",
      seats: ["J8"],
      poster: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg",
      upcoming: false,
      userId: '',
      userName: '',
      showId: '',
      showTitle: '',
      theaterId: '',
      theaterName: '',
      totalAmount: 0,
      status: 'cancelled',
      bookedAt: ''
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Special Discount!",
    message: "Enjoy 25% off on all tickets this weekend!",
    date: "2025-05-13",
    read: false
  },
  {
    id: "n2",
    title: "Booking Confirmed",
    message: "Your tickets for 'Inception 2: Dream Deeper' have been confirmed.",
    date: "2025-05-12",
    read: true
  },
  {
    id: "n3",
    title: "New Movie Alert",
    message: "The sequel to your favorite movie is now available for booking!",
    date: "2025-05-08",
    read: true
  }
];