import { CustomError } from "../errors/custom.error";

// Utility function to normalize seat types
export const normalizeSeatType = (type: string): 'Regular' | 'Premium' | 'VIP' | 'Unavailable' => {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case 'regular':
      return 'Regular';
    case 'premium':
      return 'Premium';
    case 'vip':
      return 'VIP';
    case 'unavailable':
      return 'Unavailable';
    default:
      throw new CustomError(`Invalid seat type: ${type}`, 400);
  }
};