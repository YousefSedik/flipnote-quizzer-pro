import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Quiz, Question, PaginationParams, CreateQuizParams } from '../types/quiz';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

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
      if (failureCount < 2 && error instanceof Error && error.message.includes('401')) {
        refreshToken();
        return true;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

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

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: CreateQuizParams) => {
      try {
        return await api.quiz.create(quizData);
      } catch (error) {
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

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.quiz.delete(id);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      
      queryClient.setQueryData(['quizzes', page, pageSize], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.filter((quiz: Quiz) => quiz.id !== deletedId),
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

  const deleteQuestionMutation = useMutation({
    mutationFn: ({ quizId, questionId, questionType }: { quizId: string; questionId: string; questionType: string }) => {
      return api.quiz.questions.delete(quizId, questionId, questionType);
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
      // Get the quiz from the cache or via an API call if needed
      const quiz = await queryClient.fetchQuery({
        queryKey: ['quizzes', quizId],
        queryFn: () => api.quiz.getOne(quizId),
        staleTime: 0 // Force fresh data
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
