import { Quiz, Question } from '@/types/quiz';
import { LoginResponse, RefreshResponse, ProfileResponse } from '@/types/auth';

// Let's use a variable that can be easily changed instead of hardcoding
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' // Replace with your production API URL
  : 'http://localhost:8000';

// Helper function to get auth data from localStorage
const getAuthData = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    try {
      return JSON.parse(authData);
    } catch (error) {
      console.error('Failed to parse auth data from localStorage', error);
      return null;
    }
  }
  return null;
};

// Helper function to get the access token
const getAccessToken = () => {
  const authData = getAuthData();
  return authData?.tokens?.access || null;
};

// Helper function to get the refresh token
const getRefreshToken = () => {
  const authData = getAuthData();
  return authData?.tokens?.refresh || null;
};

// Helper function to update tokens in localStorage
const updateTokensInStorage = (access: string) => {
  const authData = getAuthData();
  if (authData && authData.tokens) {
    const updatedAuthData = {
      ...authData,
      tokens: {
        ...authData.tokens,
        access,
      },
    };
    localStorage.setItem('auth', JSON.stringify(updatedAuthData));
  }
};

// Helper function to add auth headers to requests
const authHeaders = (customToken?: string) => {
  const token = customToken || getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Function to refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
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
    
    const data: RefreshResponse = await response.json();
    updateTokensInStorage(data.access);
    return data.access;
  } catch (error) {
    console.error('Token refresh failed', error);
    return null;
  }
};

// Fetch wrapper with token refresh
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // First try with current access token
  const headers = {
    ...options.headers,
    ...authHeaders(),
  };

  let response = await fetch(url, { ...options, headers });

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      // Retry with new access token
      const updatedHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newAccessToken}`,
      };
      
      response = await fetch(url, { ...options, headers: updatedHeaders });
    }
  }

  return response;
};

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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
          password2: password,
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
    
    getProfile: async (tokens?: { access: string, refresh: string }): Promise<ProfileResponse> => {
      let response;
      
      if (tokens?.access) {
        response = await fetch(`${API_URL}/auth/profile/`, {
          headers: {
            ...authHeaders(tokens.access),
            'Content-Type': 'application/json',
          },
        });
      } else {
        response = await fetchWithAuth(`${API_URL}/auth/profile/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return response.json();
    }
  },
  
  // Quiz endpoints
  quiz: {
    getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Quiz>> => {
      const response = await fetchWithAuth(`${API_URL}/quizzes?page=${page}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quizzes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          createdAt: quiz.created_at,
          is_public: quiz.is_public,
          questions: [], // Questions are loaded separately
          ownerUsername: quiz.owner_username,
        })),
      };
    },
    
    getOne: async (id: string) => {
      const response = await fetchWithAuth(`${API_URL}/quizzes/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      
      const quiz = await response.json();
      
      // Fetch questions for this quiz
      const questionsResponse = await fetch(`${API_URL}/questions/${id}`, {
        headers: authHeaders(),
      });
      
      if (!questionsResponse.ok) {
        throw new Error('Failed to fetch quiz questions');
      }
      
      const questionsData = await questionsResponse.json();
      
      // Combine MCQ and written questions
      const questions = [
        ...(questionsData.mcq_questions || []).map((q: any) => ({
          id: q.id.toString(),
          text: q.text,
          type: 'mcq' as const,
          answer: q.correct_answer,
          options: q.choices.split('|').map((choice: string, index: number) => ({
            id: index.toString(),
            text: choice,
            isCorrect: choice === q.correct_answer,
          })),
        })),
        ...(questionsData.written_questions || []).map((q: any) => ({
          id: q.id.toString(),
          text: q.text,
          type: 'written' as const,
          answer: q.answer,
        })),
      ];
      
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        createdAt: quiz.created_at,
        is_public: quiz.is_public,
        questions,
        ownerUsername: quiz.owner_username,
      };
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
      console.log(response);
      return response;
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
    
    // Public quizzes - Updated to handle errors better and use absolute URLs
    public: {
      getAll: async (page = 1, pageSize = 6): Promise<PaginatedResponse<Quiz>> => {
        try {
          const response = await fetch(`${API_URL}/quizzes/public?page=${page}&page_size=${pageSize}`);
          
          if (!response.ok) {
            // For demo/development purposes, return mock data if API is unavailable
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Using mock data for public quizzes (API unavailable)');
              return {
                count: 3,
                next: null,
                previous: null,
                results: [
                  {
                    id: 'mock-1',
                    title: 'Sample Quiz 1',
                    description: 'This is a sample quiz for testing',
                    createdAt: new Date().toISOString(),
                    is_public: true,
                    questions: [],
                    ownerUsername: 'testuser',
                  },
                  {
                    id: 'mock-2',
                    title: 'Sample Quiz 2',
                    description: 'Another sample quiz',
                    createdAt: new Date().toISOString(),
                    is_public: true,
                    questions: [],
                    ownerUsername: 'testuser',
                  },
                  {
                    id: 'mock-3',
                    title: 'Sample Quiz 3',
                    description: 'A third sample quiz',
                    createdAt: new Date().toISOString(),
                    is_public: true,
                    questions: [],
                    ownerUsername: 'testuser',
                  }
                ],
              };
            }
            
            throw new Error(`Failed to fetch public quizzes: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          return {
            count: data.count,
            next: data.next,
            previous: data.previous,
            results: data.results.map((quiz: any) => ({
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              createdAt: quiz.created_at,
              is_public: quiz.is_public,
              questions: [], // Questions are loaded separately
              ownerUsername: quiz.owner_username,
            })),
          };
        } catch (error) {
          console.error('Error fetching public quizzes:', error);
          // Return empty data structure instead of throwing
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      },
      
      getOne: async (id: string) => {
        try {
          const response = await fetch(`${API_URL}/quizzes/public/${id}`);
          
          if (!response.ok) {
            // For demo/development purposes, return mock data if API is unavailable
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Using mock data for public quiz (API unavailable)');
              return {
                id: id,
                title: 'Sample Quiz',
                description: 'This is a sample quiz for testing',
                createdAt: new Date().toISOString(),
                is_public: true,
                questions: [
                  {
                    id: 'mock-q1',
                    text: 'What is the capital of France?',
                    type: 'mcq',
                    answer: 'Paris',
                    options: [
                      { id: '1', text: 'London', isCorrect: false },
                      { id: '2', text: 'Paris', isCorrect: true },
                      { id: '3', text: 'Berlin', isCorrect: false },
                      { id: '4', text: 'Madrid', isCorrect: false },
                    ],
                  },
                  {
                    id: 'mock-q2',
                    text: 'What is 2+2?',
                    type: 'written',
                    answer: '4',
                  },
                ],
                ownerUsername: 'testuser',
              };
            }
            
            throw new Error(`Failed to fetch public quiz: ${response.status} ${response.statusText}`);
          }
          
          return response.json();
        } catch (error) {
          console.error('Error fetching public quiz:', error);
          throw error; // Rethrow to be handled by the component
        }
      }
    }
  }
};
