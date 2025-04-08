
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, AuthState, ProfileResponse } from '../types/auth';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        return {
          ...parsedAuth,
          isLoading: false,
        };
      } catch (error) {
        console.error('Failed to parse auth from localStorage', error);
      }
    }
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      tokens: undefined,
    };
  });

  // Update localStorage when authState changes
  useEffect(() => {
    if (authState.user && authState.tokens) {
      localStorage.setItem('auth', JSON.stringify({
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        tokens: authState.tokens,
      }));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authState.user, authState.isAuthenticated, authState.tokens]);

  // Setup token refresh interval
  useEffect(() => {
    if (authState.tokens?.refresh) {
      const refreshTokenInterval = setInterval(async () => {
        try {
          const response = await api.auth.refreshToken(authState.tokens!.refresh);
          setAuthState(prev => ({
            ...prev,
            tokens: {
              access: response.access,
              refresh: prev.tokens?.refresh || '',
            }
          }));
        } catch (error) {
          console.error('Token refresh failed', error);
          // If token refresh fails, log the user out
          logout();
        }
      }, 1000 * 60 * 15); // Refresh token every 15 minutes

      return () => clearInterval(refreshTokenInterval);
    }
  }, [authState.tokens?.refresh]);

  // Load user profile if we have an access token but no user data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authState.tokens?.access && !authState.user) {
        try {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          const profile = await api.auth.getProfile();
          
          // Create user object from profile data
          const user: User = {
            email: profile.email,
            name: profile.first_name || profile.email.split('@')[0],
            first_name: profile.first_name,
            last_name: profile.last_name,
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            tokens: authState.tokens,
          });
        } catch (error) {
          console.error('Failed to load user profile', error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tokens: undefined,
          });
        }
      }
    };
    
    loadUserProfile();
  }, [authState.tokens?.access]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Get tokens from login endpoint
      const tokenResponse = await api.auth.login(email, password);
      
      // Get user profile
      setAuthState(prev => ({ 
        ...prev, 
        tokens: {
          access: tokenResponse.access,
          refresh: tokenResponse.refresh
        }
      }));
      
      // The user profile will be loaded by the useEffect above
      
      toast({
        title: "Success",
        description: "You've successfully logged in",
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Call register endpoint
      await api.auth.register(name || '', email, password);
      
      // After registration, login the user to get tokens
      await login(email, password);
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      });
    }
  };

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      tokens: undefined,
    });
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
