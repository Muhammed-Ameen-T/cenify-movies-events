export interface IJwtDecoded {
  userId: string; // Matches _id from User entity
  email: string; // For email-based auth
  iat?: number; // Issued at (optional)
  exp?: number; // Expires at (optional)
}
