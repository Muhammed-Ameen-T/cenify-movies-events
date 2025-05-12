// src/application/dtos/user.dto.ts
export class UserResponseDTO {
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
    ) {}
  }
  
  export interface UpdateUserBlockStatusDTO {
    isBlocked: boolean;
  }