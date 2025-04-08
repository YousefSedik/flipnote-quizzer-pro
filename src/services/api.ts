import { Quiz, Question } from '@/types/quiz';
import { LoginResponse, RefreshResponse, ProfileResponse } from '@/types/auth';

const API_URL = 'http://localhost:8000';

// Helper function to get the access token from localStorage
const getAccessToken = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    try {
      const { tokens } = JSON.parse(authData);
      return tokens?.access;
    } catch (error) {
      console.error('Failed to parse auth data from localStorage', error);
    }
  }
  return null;
};

// Helper function to add auth headers to requests
const authHeaders = () => {
  const token = getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<LoginResponse> => {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    
    register: async (name: string, email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          first_name: name || '',
          last_name: ''
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    
    refreshToken: async (refresh: string): Promise<RefreshResponse> => {
      const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      return response.json();
    },
    
    getProfile: async (): Promise<ProfileResponse> => {
      const response = await fetch(`${API_URL}/auth/profile/`, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return response.json();
    }
  },
  
  // Quiz endpoints
  quiz: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/quizzes`, {
        headers: authHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      
      return response.json();
    },
    
    getOne: async (id: string) => {
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        headers: authHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      
      return response.json();
    },
    
    create: async (quiz: Omit<Quiz, 'id' | 'createdAt' | 'questions'>) => {
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(quiz),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }
      
      return response.json();
    },
    
    update: async (id: string, quiz: Partial<Quiz>) => {
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(quiz),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }
      
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      
      return response.json();
    },
    
    // Question endpoints
    questions: {
      create: async (quizId: string, question: Omit<Question, 'id'>) => {
        const response = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify(question),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create question');
        }
        
        return response.json();
      },
      
      update: async (quizId: string, questionId: string, question: Partial<Question>) => {
        const response = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify(question),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update question');
        }
        
        return response.json();
      },
      
      delete: async (quizId: string, questionId: string) => {
        const response = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete question');
        }
        
        return response.json();
      },
    },
    
    // Public quizzes
    public: {
      getAll: async () => {
        const response = await fetch(`${API_URL}/quizzes/public`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch public quizzes');
        }
        
        return response.json();
      },
      
      getOne: async (id: string) => {
        const response = await fetch(`${API_URL}/quizzes/public/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch public quiz');
        }
        
        return response.json();
      }
    }
  }
};
