
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { toast } from '@/hooks/use-toast';

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
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return {
          user,
          isAuthenticated: true,
          isLoading: false,
        };
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('user', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [authState.user]);

  // Mock login functionality
  const login = async (email: string, password: string) => {
    // This is a mock implementation, in a real app you'd make an API call
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Simulate API call delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Simple validation - in a real app this would be server-side
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create mock user - in a real app this would come from your API
      const user: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
      };
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
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

  // Mock register functionality
  const register = async (email: string, password: string, name?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Simulate API call delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Simple validation - in a real app this would be server-side
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create mock user - in a real app this would come from your API
      const user: User = {
        id: crypto.randomUUID(),
        email,
        name: name || email.split('@')[0],
      };
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
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

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  };

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
