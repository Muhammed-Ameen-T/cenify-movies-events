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

export interface Transaction {
  id: string;
  amount: number;
  remark?: string;
  type: 'credit' | 'debit';
  source: 'loyality' | 'refund' | 'topup' | 'booking';
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface MoviePassHistory {
  title: string;
  date: string;
  saved: number;
}

export interface MoviePassData {
  id: string;
  userId: string;
  status: 'Active' | 'Inactive';
  history: MoviePassHistory[];
  purchaseDate: string;
  expireDate: string;
  moneySaved: number;
  totalMovies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Wallet {
  _id: string | null;
  userId: string;
  balance: number;
  transactions: {
    amount: number;
    remark: string;
    type: 'debit' | 'credit';
    source: 'loyality' | 'refund' | 'topup' | 'booking';
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}


export type TabType = 'account' | 'bookings' | 'notifications' | 'rewards' | 'loyalty' | 'moviepass';