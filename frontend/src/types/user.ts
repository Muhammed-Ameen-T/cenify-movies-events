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