export interface User{
    id: string;
    name: string;
    email: string | null;
    phone: number | null;
    profileImage: string | null;
    role: string | null;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    role: null | string
}   

export interface AuthResponse {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: number;
      profileImage: string | null;
      role:string | null;
    };
}