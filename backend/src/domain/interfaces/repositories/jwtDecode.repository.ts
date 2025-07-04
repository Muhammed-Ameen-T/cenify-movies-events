export interface IJwtDecoded {
  userId: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  iat?: number;
  exp?: number;
}
