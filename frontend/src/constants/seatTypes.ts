import { SeatPrice } from '../types/theater';

export const SEAT_TYPES = {
  REGULAR: { name: 'Regular', color: 'bg-blue-500', price: 200 },
  PREMIUM: { name: 'Premium', color: 'bg-purple-500', price: 350 },
  VIP: { name: 'VIP', color: 'bg-amber-500', price: 500 },
  UNAVAILABLE: { name: 'Unavailable', color: 'bg-gray-500', price: 0 },
};

export type SeatType = keyof typeof SEAT_TYPES;

export const getDefaultSeatPrices = (): SeatPrice => ({
  regular: SEAT_TYPES.REGULAR.price,
  premium: SEAT_TYPES.PREMIUM.price,
  vip: SEAT_TYPES.VIP.price,
});