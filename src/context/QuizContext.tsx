
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Quiz, Question } from '../types/quiz';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  
  // Fetch quizzes
  const { 
    data: quizzes = [], 
    error, 
    isLoading 
  } = useQuery({
    queryKey: ['quizzes'],
    queryFn: api.quiz.getAll,
  });

  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: (quizData: { title: string; description: string; isPublic: boolean }) => {
      return api.quiz.create(quizData);
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
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
