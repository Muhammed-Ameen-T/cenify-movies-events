// Seat types with their associated properties
export const SEAT_TYPES = {
    REGULAR: { name: 'Regular', color: 'bg-blue-500', price: 200 },
    PREMIUM: { name: 'Premium', color: 'bg-purple-500', price: 350 },
    VIP: { name: 'VIP', color: 'bg-amber-500', price: 500 },
    DISABLED: { name: 'Accessible', color: 'bg-green-500', price: 200 },
    UNAVAILABLE: { name: 'Unavailable', color: 'bg-gray-500', price: 0 },
    RECLINER: { name: 'Recliner', color: 'bg-red-500', price: 600 }
  };
  
  export type SeatType = keyof typeof SEAT_TYPES;