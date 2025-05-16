// src/types/user.ts
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: number | null;
    role: 'user' | 'admin' | 'moderator' | 'vendor';
    isBlocked: boolean; // Added
    status: 'active' | 'blocked'; // Kept for UI compatibility
    createdAt: string;
    updatedAt: string;
    profileImage?: string | null;
  }

  export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  role: 'user' | 'admin' | 'vendor';
  loyalityPoints: number | null; // Match backend typo
  dateOfBirth: string | null;
  joinedDate: string;
}

export interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}
export type TabType = 'account' | 'bookings' | 'notifications' | 'rewards' | 'loyalty' | 'moviepass';