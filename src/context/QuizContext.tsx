
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Quiz, Question, PaginationParams } from '../types/quiz';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

interface QuizContextProps {
  quizzes: Quiz[];
  isLoading: boolean;
  error: Error | null;
  createQuiz: (title: string, description: string, isPublic?: boolean) => Promise<Quiz>;
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
  
  // Fetch quizzes only when authenticated
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
      // If we get a 401 error, try refreshing the token outside this function
      if (failureCount < 2 && error instanceof Error && error.message.includes('401')) {
        // Trigger token refresh - we don't await here
        refreshToken();
        return true; // retry
      }
      return failureCount < 2; // standard retry logic
    },
  });

  // Manual handling of token refresh and refetch
  useEffect(() => {
    const handleTokenRefresh = async () => {
      if (error instanceof Error && error.message.includes('401')) {
        const newToken = await refreshToken();
        if (newToken) {
          refetch();
        }
      }
    };
    
    if (error) {
      handleTokenRefresh();
    }
  }, [error, refreshToken, refetch]);

  // Refetch quizzes when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.tokens?.access) {
      refetch();
    }
  }, [authState.isAuthenticated, authState.tokens?.access, refetch]);

  const quizzes = quizzesData?.results || [];
  const totalItems = quizzesData?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginationParams: PaginationParams = {
    page,
    pageSize,
    totalItems,
    totalPages,
  };

  // Create quiz mutation with token refresh handling
  const createQuizMutation = useMutation({
    mutationFn: async (quizData: { title: string; description: string; isPublic: boolean }) => {
      try {
        return await api.quiz.create(quizData);
      } catch (error) {
        // If it's an auth error, try refreshing token and retry
        if (error instanceof Error && error.message.includes('401')) {
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive"
      });
    }
  });

  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: (quiz: Quiz) => {
      return api.quiz.update(quiz.id, quiz);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quiz",
        variant: "destructive"
      });
    }
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: (id: string) => {
      return api.quiz.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quiz",
        variant: "destructive"
      });
    }
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: ({ quizId, question }: { quizId: string; question: Omit<Question, 'id'> }) => {
      return api.quiz.questions.create(quizId, question);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      toast({
        title: "Success",
        description: "Question added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add question",
        variant: "destructive"
      });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ quizId, question }: { quizId: string; question: Question }) => {
      return api.quiz.questions.update(quizId, question.id, question);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      toast({
        title: "Success",
        description: "Question updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive"
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) => {
      return api.quiz.questions.delete(quizId, questionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      toast({
        title: "Success",
        description: "Question deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive"
      });
    }
  });

  const createQuiz = async (title: string, description: string, isPublic: boolean = false): Promise<Quiz> => {
    return createQuizMutation.mutateAsync({ title, description, isPublic });
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
    await deleteQuestionMutation.mutateAsync({ quizId, questionId });
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
