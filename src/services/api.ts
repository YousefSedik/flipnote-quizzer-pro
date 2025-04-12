import { Quiz, Question, CreateQuizParams } from '@/types/quiz';
import { LoginResponse, RefreshResponse, ProfileResponse } from '@/types/auth';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://flipnote-quizzer-backend.azurewebsites.net' 
  : 'http://localhost:8000';

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

const getAccessToken = () => {
  const authData = getAuthData();
  return authData?.tokens?.access || null;
};

const getRefreshToken = () => {
  const authData = getAuthData();
  return authData?.tokens?.refresh || null;
};

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

const authHeaders = (customToken?: string) => {
  const token = customToken || getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

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

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    ...authHeaders(),
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
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
      
      const questionsResponse = await fetch(`${API_URL}/questions/${id}`, {
        headers: authHeaders(),
      });
      
      if (!questionsResponse.ok) {
        throw new Error('Failed to fetch quiz questions');
      }
      
      const questionsData = await questionsResponse.json();
      
      const mcqQuestions = (questionsData.mcq_questions || []).map((q: any) => ({
        id: q.id.toString(),
        text: q.text,
        type: 'mcq' as const,
        answer: q.correct_answer,
        options: (q.choices || []).map((choice: string, index: number) => ({
          id: index.toString(),
          text: choice,
          isCorrect: choice === q.correct_answer,
        })),
      }));
      
      const writtenQuestions = (questionsData.written_questions || []).map((q: any) => ({
        id: q.id.toString(),
        text: q.text,
        type: 'written' as const,
        answer: q.answer,
      }));
      
      const quizData = questionsData.quiz || quiz;
      
      return {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        createdAt: quizData.created_at,
        is_public: quizData.is_public,
        questions: [...mcqQuestions, ...writtenQuestions],
        ownerUsername: quizData.owner_username,
      };
    },
    
    create: async (quiz: CreateQuizParams): Promise<Quiz> => {
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
      return response;
    },
    
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
    
    public: {
      getAll: async (page = 1, pageSize = 6): Promise<PaginatedResponse<Quiz>> => {
        try {
          const response = await fetch(`${API_URL}/quizzes/public?page=${page}&page_size=${pageSize}`);
          
          if (!response.ok) {
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
          const response = await fetch(`${API_URL}/quizzes/${id}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch public quiz: ${response.status} ${response.statusText}`);
          }
          
          const quiz = await response.json();
          
          const questionsResponse = await fetch(`${API_URL}/questions/${id}`);
          
          if (!questionsResponse.ok) {
            throw new Error('Failed to fetch quiz questions');
          }
          
          const questionsData = await questionsResponse.json();
          
          const mcqQuestions = (questionsData.mcq_questions || []).map((q: any) => ({
            id: q.id.toString(),
            text: q.text,
            type: 'mcq' as const,
            answer: q.correct_answer,
            options: (q.choices || []).map((choice: string, index: number) => ({
              id: index.toString(),
              text: choice,
              isCorrect: choice === q.correct_answer,
            })),
          }));
          
          const writtenQuestions = (questionsData.written_questions || []).map((q: any) => ({
            id: q.id.toString(),
            text: q.text,
            type: 'written' as const,
            answer: q.answer,
          }));
          
          const quizData = questionsData.quiz || quiz;
          
          return {
            id: quizData.id,
            title: quizData.title,
            description: quizData.description,
            createdAt: quizData.created_at,
            is_public: quizData.is_public,
            questions: [...mcqQuestions, ...writtenQuestions],
            ownerUsername: quizData.owner_username,
          };
        } catch (error) {
          console.error('Error fetching public quiz:', error);
          throw error;
        }
      }
    },
    
    getHistory: async (): Promise<PaginatedResponse<Quiz>> => {
      try {
        const response = await fetchWithAuth(`${API_URL}/quizzes/history`);
        
        if (!response.ok) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Using mock data for quiz history (API unavailable)');
            return {
              count: 3,
              next: null,
              previous: null,
              results: [
                {
                  id: 'mock-history-1',
                  title: 'JavaScript Fundamentals',
                  description: 'Test your JavaScript knowledge',
                  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                  is_public: true,
                  questions: [],
                  ownerUsername: 'testuser',
                  last_accessed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                },
                {
                  id: 'mock-history-2',
                  title: 'React Hooks Quiz',
                  description: 'Learn about React hooks',
                  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
                  is_public: false,
                  questions: [],
                  ownerUsername: 'testuser',
                  last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
                },
                {
                  id: 'mock-history-3',
                  title: 'TypeScript Basics',
                  description: 'Master TypeScript fundamentals',
                  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                  is_public: true,
                  questions: [],
                  ownerUsername: 'testuser',
                  last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                }
              ],
            };
          }
          
          throw new Error(`Failed to fetch quiz history: ${response.status} ${response.statusText}`);
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
            last_accessed: quiz.last_accessed,
          })),
        };
      } catch (error) {
        console.error('Error fetching quiz history:', error);
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
    }
  }
};
