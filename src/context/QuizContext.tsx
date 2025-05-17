import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Quiz, Question, PaginationParams, CreateQuizParams } from '../types/quiz';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import axios, { AxiosError } from 'axios';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface QuizContextProps {
  quizzes: Quiz[];
  isLoading: boolean;
  error: Error | null;
  createQuiz: (title: string, description: string, is_public?: boolean) => Promise<Quiz>;
  updateQuiz: (quiz: Quiz) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  addQuestion: (quizId: string, question: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (quizId: string, question: Question) => Promise<void>;
  deleteQuestion: (quizId: string, questionId: string) => Promise<void>;
  getQuiz: (id: string) => Quiz | undefined;
  paginationParams: PaginationParams;
  setPage: (page: number) => void;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider = ({ children }: QuizProviderProps) => {
  const queryClient = useQueryClient();
  const { authState, refreshToken } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { 
    data: quizzesData, 
    error, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['quizzes', page, pageSize],
    queryFn: () => api.quiz.getAll(page, pageSize),
    enabled: !!authState.isAuthenticated && !!authState.tokens?.access,
    retry: (failureCount, error) => {
      if (failureCount < 2 && error instanceof AxiosError && error.response?.status === 401) {
        refreshToken();
        return true;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const quizzes = quizzesData?.results || [];
  const totalItems = quizzesData?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginationParams: PaginationParams = {
    page,
    pageSize,
    totalItems,
    totalPages,
  };

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: CreateQuizParams) => {
      try {
        return await api.quiz.create(quizData);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          await refreshToken();
          return api.quiz.create(quizData);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create quiz",
        variant: "destructive"
      });
    }
  });

  const updateQuizMutation = useMutation({
    mutationFn: async (quiz: Quiz) => {
      try {
        return await api.quiz.update(quiz.id, quiz);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          await refreshToken();
          return api.quiz.update(quiz.id, quiz);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update quiz",
        variant: "destructive"
      });
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.quiz.delete(id);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          await refreshToken();
          await api.quiz.delete(id);
        } else {
          throw error;
        }
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidate all quiz-related queries
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      
      // Optimistically update the quizzes list
      queryClient.setQueryData<PaginatedResponse<Quiz>>(['quizzes', page, pageSize], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.filter((quiz) => quiz.id !== deletedId),
          count: oldData.count - 1
        };
      });

      toast({
        title: "Success",
        description: "Quiz deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quiz",
        variant: "destructive"
      });
    }
  });

  const addQuestionMutation = useMutation({
    mutationFn: async ({ quizId, question }: { quizId: string; question: Omit<Question, 'id'> }) => {
      try {
        return await api.quiz.questions.create(quizId, question);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          await refreshToken();
          return api.quiz.questions.create(quizId, question);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      toast({
        title: "Success",
        description: "Question added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add question",
        variant: "destructive"
      });
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ quizId, question }: { quizId: string; question: Question }) => {
      try {
        return await api.quiz.questions.update(quizId, question.id, question);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          await refreshToken();
          return api.quiz.questions.update(quizId, question.id, question);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      toast({
        title: "Success",
        description: "Question updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update question",
        variant: "destructive"
      });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async ({ quizId, questionId, questionType }: { quizId: string; questionId: string; questionType: string }) => {
      try {
        await api.quiz.questions.delete(quizId, questionId, questionType);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          await refreshToken();
          await api.quiz.questions.delete(quizId, questionId, questionType);
        } else {
          throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      toast({
        title: "Success",
        description: "Question deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete question",
        variant: "destructive"
      });
    }
  });

  const createQuiz = async (title: string, description: string, is_public: boolean = false): Promise<Quiz> => {
    return createQuizMutation.mutateAsync({ title, description, is_public });
  };

  const updateQuiz = async (quiz: Quiz): Promise<void> => {
    await updateQuizMutation.mutateAsync(quiz);
  };

  const deleteQuiz = async (id: string): Promise<void> => {
    await deleteQuizMutation.mutateAsync(id);
  };

  const addQuestion = async (quizId: string, question: Omit<Question, 'id'>): Promise<void> => {
    await addQuestionMutation.mutateAsync({ quizId, question });
  };

  const updateQuestion = async (quizId: string, question: Question): Promise<void> => {
    await updateQuestionMutation.mutateAsync({ quizId, question });
  };

  const deleteQuestion = async (quizId: string, questionId: string): Promise<void> => {
    try {
      const quiz = await queryClient.fetchQuery({
        queryKey: ['quizzes', quizId],
        queryFn: () => api.quiz.getOne(quizId),
        staleTime: 0
      });
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) {
        throw new Error('Question not found');
      }
      
      await deleteQuestionMutation.mutateAsync({ 
        quizId, 
        questionId,
        questionType: question.type
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete question",
          variant: "destructive"
        });
      }
    }
  };

  const getQuiz = (id: string) => {
    return quizzes.find((quiz) => quiz.id === id);
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        isLoading,
        error,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        getQuiz,
        paginationParams,
        setPage,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
