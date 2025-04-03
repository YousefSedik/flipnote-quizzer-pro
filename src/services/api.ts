
import { Quiz, Question } from '@/types/quiz';

const API_URL = 'http://localhost:8000';

export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    
    register: async (name: string, email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    
    logout: async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
      }
      
      return response.json();
    },
    
    me: async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      return response.json();
    }
  },
  
  // Quiz endpoints
  quiz: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/quizzes`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      
      return response.json();
    },
    
    getOne: async (id: string) => {
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        credentials: 'include',
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
        },
        body: JSON.stringify(quiz),
        credentials: 'include',
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
        },
        body: JSON.stringify(quiz),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }
      
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
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
          },
          body: JSON.stringify(question),
          credentials: 'include',
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
          },
          body: JSON.stringify(question),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to update question');
        }
        
        return response.json();
      },
      
      delete: async (quizId: string, questionId: string) => {
        const response = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`, {
          method: 'DELETE',
          credentials: 'include',
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
