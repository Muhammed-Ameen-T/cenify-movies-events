// src/application/dtos/user.dto.ts
export class UserResponseDTO {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public phone: number | null,
    public role: string,
    public isBlocked: boolean | null,
    public createdAt: string,
    public updatedAt: string,
    public profileImage: string | null,
  ) {}
}

export interface UpdateUserBlockStatusDTO {
  isBlocked: boolean;
}

export class UpdateProfileRequestDTO {
  constructor(
    public name?: string,
    public phone?: number | null,
    public profileImage?: string | null,
    public dob?: Date | null,
  ) {}
}

export class UserProfileResponseDTO {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public phone: number | null,
    public role: 'user' | 'admin' | 'vendor',
    public isBlocked: boolean | null,
    public createdAt: string,
    public updatedAt: string,
    public profileImage: string | null,
    public loyalityPoints: number | null, // Added to match User entity
  ) {}
}

export class ChangePasswordRequestDTO {
  constructor(
    public userId: string,
    public oldPassword: string,
    public newPassword: string,
  ) {
    if (!oldPassword || !newPassword) {
      throw new Error('oldPassword and newPassword are required');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }
  }
}
