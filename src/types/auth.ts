
export interface User {
  id?: string;
  email: string;
  name?: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface ProfileResponse {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}
