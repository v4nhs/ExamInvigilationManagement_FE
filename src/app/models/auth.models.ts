export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  authenticated: boolean;
  token: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}
