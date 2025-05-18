import { Quiz, Question, CreateQuizParams } from '@/types/quiz';
import { LoginResponse, RefreshResponse, ProfileResponse } from '@/types/auth';
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://flipnote-quizzer-backend.azurewebsites.net' 
  : 'http://localhost:8000';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = () => {
  cache.clear();
};

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

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refresh = getRefreshToken();
        if (!refresh) throw new Error('No refresh token available');

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        const { access } = response.data;
        
        updateTokensInStorage(access);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const clearQuizCaches = () => {
  for (const key of cache.keys()) {
    if (key.includes('/quizzes')) {
      cache.delete(key);
    }
  }
};

// Add this helper function before the api object
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const api = {
  clearCache,
  auth: {
    login: async (email: string, password: string): Promise<LoginResponse> => {
      const response = await axiosInstance.post('/auth/login/', { email, password });
      return response.data;
    },

    register: async (username: string, email: string, password: string, name?: string) => {
      const response = await axiosInstance.post('/auth/register/', {
        username,
        email,
        password,
        password2: password,
        first_name: name || '',
        last_name: ''
      });
      return response.data;
    },

    refreshToken: async (refresh: string): Promise<RefreshResponse> => {
      const response = await axiosInstance.post('/auth/token/refresh/', { refresh });
      return response.data;
    },

    getProfile: async (tokens?: { access: string, refresh: string }): Promise<ProfileResponse> => {
      const config = tokens?.access ? {
        headers: { Authorization: `Bearer ${tokens.access}` }
      } : undefined;
      
      const response = await axiosInstance.get('/auth/profile/', config);
      return response.data;
    }
  },

  quiz: {
    getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Quiz>> => {
      const cacheKey = `/quizzes?page=${page}&page_size=${pageSize}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await axiosInstance.get('/quizzes', {
        params: { page, page_size: pageSize }
      });

      const result = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          createdAt: quiz.created_at,
          is_public: quiz.is_public,
          questions: [],
          ownerUsername: quiz.owner_username,
        })),
      };

      setCachedData(cacheKey, result);
      return result;
    },

    search: async (query: string): Promise<PaginatedResponse<Quiz>> => {
      const cacheKey = `/quiz/search?q=${query}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await axiosInstance.get('/quiz/search', {
        params: { q: query }
      });

      const result = {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          createdAt: quiz.created_at,
          is_public: quiz.is_public,
          questions: [],
          ownerUsername: quiz.owner_username,
          views_count: quiz.views_count
        })),
      };

      setCachedData(cacheKey, result);
      return result;
    },

    getOne: async (id: string) => {
      const response = await axiosInstance.get(`/quizzes/${id}`);
      const quiz = response.data;

      const questionsResponse = await axiosInstance.get(`/questions/${id}`);
      const questionsData = questionsResponse.data;

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

      // Combine and shuffle all questions
      const allQuestions = [...mcqQuestions, ...writtenQuestions];
      const shuffledQuestions = shuffleArray(allQuestions);

      return {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        createdAt: quizData.created_at,
        is_public: quizData.is_public,
        questions: shuffledQuestions,
        ownerUsername: quizData.owner_username,
      };
    },
    
    create: async (quiz: CreateQuizParams): Promise<Quiz> => {
      const response = await axiosInstance.post('/quizzes', quiz);
      return response.data;
    },

    update: async (id: string, quiz: Partial<Quiz>) => {
      const response = await axiosInstance.put(`/quizzes/${id}`, quiz);
      return response.data;
    },

    delete: async (id: string) => {
      await axiosInstance.delete(`/quizzes/${id}`);
      clearQuizCaches();
    },

    questions: {
      create: async (quizId: string, question: Omit<Question, 'id'>) => {
        let requestData;
        
        if (question.type === 'mcq' && question.options) {
          const optionTexts = Array.isArray(question.options) ? 
            question.options.map(o => typeof o === 'string' ? o : o.text) : 
            [];
            
          requestData = {
            text: question.text,
            type: 'mcq',
            choices: optionTexts,
            correct_answer: question.answer
          };
        } else {
          requestData = {
            text: question.text,
            type: 'written',
            answer: question.answer
          };
        }
        
        const response = await axiosInstance.post(`/quizzes/${quizId}/questions`, requestData);
        return response.data;
      },

      update: async (quizId: string, questionId: string, question: Partial<Question>) => {
        const qtype = question.type === 'mcq' ? 'mcq' : 'written';
        const response = await axiosInstance.put(
          `/quizzes/${quizId}/questions/${questionId}/${qtype}`,
          question
        );
        return response.data;
      },

      delete: async (quizId: string, questionId: string, questionType: string) => {
        const qtype = questionType === 'mcq' ? 'mcq' : 'written';
        await axiosInstance.delete(`/quizzes/${quizId}/questions/${questionId}/${qtype}`);
      },
    },

    extractQuestions: async (file: File, quizId: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quizId', quizId);
      
      const response = await axiosInstance.post('/quizzes/extract-questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    extractQuestionsFromText: async (text: string, quizId: string) => {
      const response = await axiosInstance.post('/quizzes/extract-questions/text', {
        text,
        quizId,
      });
      return response.data;
    },

    public: {
      getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Quiz>> => {
        const cacheKey = `/quizzes/public?page=${page}&page_size=${pageSize}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }

        const response = await axiosInstance.get('/quizzes/public', {
          params: { page, page_size: pageSize }
        });

        const result = {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            createdAt: quiz.created_at,
            is_public: quiz.is_public,
            questions: [],
            ownerUsername: quiz.owner_username,
            views_count: quiz.views_count
          })),
        };

        setCachedData(cacheKey, result);
        return result;
      },

      getOne: async (id: string) => {
        const response = await axiosInstance.get(`/quizzes/${id}`);
        const quiz = response.data;

        const questionsResponse = await axiosInstance.get(`/questions/${id}`);
        const questionsData = questionsResponse.data;

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

        // Combine and shuffle all questions
        const allQuestions = [...mcqQuestions, ...writtenQuestions];
        const shuffledQuestions = shuffleArray(allQuestions);

        return {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          createdAt: quizData.created_at,
          is_public: quizData.is_public,
          questions: shuffledQuestions,
          ownerUsername: quizData.owner_username,
        };
      }
    },

    getHistory: async (): Promise<PaginatedResponse<Quiz>> => {
      // Clear any cached history data
      for (const key of cache.keys()) {
        if (key.includes('/quizzes/history')) {
          cache.delete(key);
        }
      }

      const response = await axiosInstance.get('/quizzes/history');
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          createdAt: quiz.created_at,
          is_public: quiz.is_public,
          questions: [],
          ownerUsername: quiz.owner_username,
          last_accessed: quiz.last_accessed,
          views_count: quiz.views_count
        })),
      };
    }
  }
};
