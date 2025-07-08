// data.ts
import { Theater, DashboardSummary } from './types';

export const theaterData: Theater[] = [
  {
    id: 1,
    name: "Grand Cinema",
    location: "Downtown",
    screens: 8,
    capacity: 1200,
    status: "active",
    images: ["/api/placeholder/600/400", "/api/placeholder/600/400", "/api/placeholder/600/400"],
    description: "Our flagship theater with IMAX screens and premium seating options."
  },
  {
    id: 2,
    name: "StarView Multiplex",
    location: "Westside Mall",
    screens: 6,
    capacity: 900,
    status: "active",
    images: ["/api/placeholder/600/400", "/api/placeholder/600/400", "/api/placeholder/600/400"],
    description: "Modern multiplex with the latest sound systems and comfortable recliners."
  },
  {
    id: 3,
    name: "Retro Cinema",
    location: "Arts District",
    screens: 3,
    capacity: 450,
    status: "maintenance",
    images: ["/api/placeholder/600/400", "/api/placeholder/600/400", "/api/placeholder/600/400"],
    description: "Vintage theater specializing in classic films and independent movies."
  },
  {
    id: 4,
    name: "Lakeside Drive-In",
    location: "North Lake",
    screens: 2,
    capacity: 200,
    status: "active",
    images: ["/api/placeholder/600/400", "/api/placeholder/600/400", "/api/placeholder/600/400"],
    description: "Nostalgic drive-in experience with digital projection and food service."
  }
];

export const dashboardData: DashboardSummary = {
  totalTheaters: 12,
  activeTheaters: 10,
  totalShows: 248,
  totalBookings: 12680,
  revenue: 895400,
  popularTheaters: [
    { name: "Grand Cinema", bookings: 4230 },
    { name: "StarView Multiplex", bookings: 3150 },
    { name: "Cineplex Downtown", bookings: 2840 }
  ],
  popularMovies: [
    { name: "Interstellar 2", bookings: 2430 },
    { name: "The Avengers: Final Return", bookings: 2120 },
    { name: "Life of Pi 2", bookings: 1780 }
  ]
};
