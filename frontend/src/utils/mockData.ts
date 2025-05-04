import { Theater, Show, Event, Booking, Statistics, User } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Theater Admin',
  email: 'admin@theaterx.com',
  role: 'admin',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
};

export const theaters: Theater[] = [
  {
    id: '1',
    name: 'Grand Theater',
    location: 'New York, NY',
    capacity: 500,
    description: 'A prestigious theater with state-of-the-art facilities and comfortable seating.',
    image: 'https://images.pexels.com/photos/109669/pexels-photo-109669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'active',
    amenities: ['Parking', 'Food Court', 'VIP Lounge', 'Accessibility'],
    createdAt: '2023-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Cinema Palace',
    location: 'Los Angeles, CA',
    capacity: 350,
    description: 'Modern cinema complex with the latest projection and sound systems.',
    image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'active',
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'Arcade'],
    createdAt: '2023-02-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Royal Stage',
    location: 'Chicago, IL',
    capacity: 420,
    description: 'Historic theater known for its excellent acoustics and classic architecture.',
    image: 'https://images.pexels.com/photos/11261015/pexels-photo-11261015.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'maintenance',
    amenities: ['Valet Parking', 'Bar', 'Restaurant', 'Gift Shop'],
    createdAt: '2023-03-05T09:45:00Z'
  },
  {
    id: '4',
    name: 'Metro Screening Hall',
    location: 'San Francisco, CA',
    capacity: 280,
    description: 'Boutique theater specializing in independent and art house films.',
    image: 'https://images.pexels.com/photos/7234255/pexels-photo-7234255.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'inactive',
    amenities: ['Café', 'Book Store', 'Art Gallery'],
    createdAt: '2023-04-12T16:20:00Z'
  },
];

export const shows: Show[] = [
  {
    id: '1',
    title: 'The Phantom of the Opera',
    description: 'The classic musical returns with a new cast and spectacular effects.',
    theaterId: '1',
    theaterName: 'Grand Theater',
    startDate: '2023-06-01T19:00:00Z',
    endDate: '2023-08-30T22:00:00Z',
    duration: 180,
    image: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: {
      standard: 75,
      premium: 120,
      vip: 200
    },
    status: 'ongoing',
    tags: ['Musical', 'Classic', 'Broadway'],
    createdAt: '2023-04-15T11:30:00Z'
  },
  {
    id: '2',
    title: 'Inception: The Experience',
    description: 'An immersive adaptation of the mind-bending film.',
    theaterId: '2',
    theaterName: 'Cinema Palace',
    startDate: '2023-07-15T20:00:00Z',
    endDate: '2023-09-15T23:00:00Z',
    duration: 165,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: {
      standard: 60,
      premium: 100
    },
    status: 'upcoming',
    tags: ['Adaptation', 'Sci-Fi', 'Immersive'],
    createdAt: '2023-05-02T14:45:00Z'
  },
  {
    id: '3',
    title: 'Hamlet',
    description: 'Shakespeare\'s masterpiece performed by the National Theater Company.',
    theaterId: '3',
    theaterName: 'Royal Stage',
    startDate: '2023-05-10T19:30:00Z',
    endDate: '2023-06-25T22:30:00Z',
    duration: 195,
    image: 'https://images.pexels.com/photos/11824392/pexels-photo-11824392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: {
      standard: 55,
      premium: 95,
      vip: 150
    },
    status: 'completed',
    tags: ['Shakespeare', 'Drama', 'Classic'],
    createdAt: '2023-03-20T10:15:00Z'
  },
  {
    id: '4',
    title: 'Moonlight Sonata',
    description: 'A new original play exploring themes of loss, memory, and redemption.',
    theaterId: '4',
    theaterName: 'Metro Screening Hall',
    startDate: '2023-08-05T18:30:00Z',
    endDate: '2023-09-10T21:00:00Z',
    duration: 140,
    image: 'https://images.pexels.com/photos/358532/pexels-photo-358532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: {
      standard: 45,
      premium: 80
    },
    status: 'upcoming',
    tags: ['Contemporary', 'Drama', 'Original'],
    createdAt: '2023-06-01T09:30:00Z'
  },
  {
    id: '5',
    title: 'The Lion King',
    description: 'The beloved Broadway musical with stunning puppetry and music.',
    theaterId: '1',
    theaterName: 'Grand Theater',
    startDate: '2023-09-10T19:00:00Z',
    endDate: '2023-12-15T22:00:00Z',
    duration: 165,
    image: 'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: {
      standard: 80,
      premium: 130,
      vip: 220
    },
    status: 'upcoming',
    tags: ['Musical', 'Family', 'Broadway'],
    createdAt: '2023-06-15T13:45:00Z'
  },
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Summer Film Festival',
    description: 'Annual event showcasing independent films from around the world.',
    type: 'movie',
    startDate: '2023-07-10T10:00:00Z',
    endDate: '2023-07-17T22:00:00Z',
    location: 'Grand Theater & Cinema Palace',
    status: 'published',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    capacity: 1000,
    ticketsSold: 850,
    revenue: 42500,
    tags: ['Festival', 'Independent', 'International'],
    createdAt: '2023-04-05T11:20:00Z'
  },
  {
    id: '2',
    title: 'Broadway Week',
    description: 'Special performances and discounted tickets for Broadway shows.',
    type: 'theater',
    startDate: '2023-08-15T10:00:00Z',
    endDate: '2023-08-22T22:00:00Z',
    location: 'Grand Theater',
    status: 'draft',
    image: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    capacity: 800,
    ticketsSold: 0,
    revenue: 0,
    tags: ['Broadway', 'Special', 'Discount'],
    createdAt: '2023-06-12T15:45:00Z'
  },
  {
    id: '3',
    title: 'Rock Symphony Night',
    description: 'Classic rock songs performed by a full symphony orchestra.',
    type: 'concert',
    startDate: '2023-06-25T19:30:00Z',
    endDate: '2023-06-25T23:00:00Z',
    location: 'Royal Stage',
    status: 'published',
    image: 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    capacity: 420,
    ticketsSold: 388,
    revenue: 29100,
    tags: ['Concert', 'Rock', 'Symphony'],
    createdAt: '2023-05-10T14:30:00Z'
  },
];

export const bookings: Booking[] = Array.from({ length: 200 }, (_, i) => {
  const showIndex = i % shows.length;
  const show = shows[showIndex];
  const status = ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)] as 'confirmed' | 'pending' | 'cancelled';
  const seatsCount = Math.floor(Math.random() * 4) + 1;
  const seats = Array.from({ length: seatsCount }, (_, j) => 
    `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${Math.floor(Math.random() * 20) + 1}`
  );
  const totalAmount = seatsCount * show.price.standard;
  const bookedAtDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
  
  return {
    id: `booking-${i + 1}`,
    userId: `user-${Math.floor(Math.random() * 100) + 1}`,
    userName: `Customer ${Math.floor(Math.random() * 100) + 1}`,
    showId: show.id,
    showTitle: show.title,
    theaterId: show.theaterId,
    theaterName: show.theaterName,
    seats,
    totalAmount,
    status,
    bookedAt: bookedAtDate.toISOString()
  };
});

export const statistics: Statistics = {
  totalRevenue: 487500,
  ticketsSold: 1526,
  activeShows: 3,
  averageOccupancy: 78.5,
  revenuePerShow: [
    { name: 'The Phantom of the Opera', value: 142500 },
    { name: 'The Lion King', value: 98000 },
    { name: 'Hamlet', value: 86300 },
    { name: 'Inception: The Experience', value: 75400 },
    { name: 'Moonlight Sonata', value: 42800 }
  ],
  monthlyRevenue: [
    { name: 'Jan', value: 32500 },
    { name: 'Feb', value: 38700 },
    { name: 'Mar', value: 42300 },
    { name: 'Apr', value: 47500 },
    { name: 'May', value: 55600 },
    { name: 'Jun', value: 61200 },
    { name: 'Jul', value: 58900 },
    { name: 'Aug', value: 53400 },
    { name: 'Sep', value: 48700 },
    { name: 'Oct', value: 45800 },
    { name: 'Nov', value: 0 },
    { name: 'Dec', value: 0 }
  ],
  topSellingShows: [
    { id: '1', title: 'The Phantom of the Opera', tickets: 452, revenue: 142500 },
    { id: '5', title: 'The Lion King', tickets: 381, revenue: 98000 },
    { id: '3', title: 'Hamlet', tickets: 317, revenue: 86300 }
  ],
  occupancyRate: [
    { name: 'Grand Theater', rate: 85 },
    { name: 'Cinema Palace', rate: 76 },
    { name: 'Royal Stage', rate: 92 },
    { name: 'Metro Screening Hall', rate: 61 }
  ]
};