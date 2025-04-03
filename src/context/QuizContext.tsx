
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Quiz, Question } from '../types/quiz';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

interface QuizContextProps {
  quizzes: Quiz[];
  createQuiz: (title: string, description: string, isPublic?: boolean) => Quiz;
  updateQuiz: (quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;
  addQuestion: (quizId: string, question: Omit<Question, 'id'>) => void;
  updateQuestion: (quizId: string, question: Question) => void;
  deleteQuestion: (quizId: string, questionId: string) => void;
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
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const savedQuizzes = localStorage.getItem('quizzes');
    if (savedQuizzes) {
      try {
        // Convert string dates back to Date objects
        return JSON.parse(savedQuizzes, (key, value) => {
          if (key === 'createdAt') {
            return new Date(value);
          }
          return value;
        });
      } catch (error) {
        console.error('Failed to parse quizzes from localStorage', error);
        return [];
      }
    }
    return [];
  });

  // Save quizzes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const createQuiz = (title: string, description: string, isPublic: boolean = false): Quiz => {
    const newQuiz: Quiz = {
      id: uuidv4(),
      title,
      description,
      questions: [],
      createdAt: new Date(),
      isPublic,
    };
    setQuizzes((prev) => [...prev, newQuiz]);
    toast({
      title: "Success",
      description: "Quiz created successfully"
    });
    return newQuiz;
  };

  const updateQuiz = (updatedQuiz: Quiz) => {
    setQuizzes((prev) =>
      prev.map((quiz) => (quiz.id === updatedQuiz.id ? updatedQuiz : quiz))
    );
    toast({
      title: "Success",
      description: "Quiz updated successfully"
    });
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    toast({
      title: "Success",
      description: "Quiz deleted successfully"
    });
  };

  const addQuestion = (quizId: string, question: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...question,
      id: uuidv4(),
    };
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id === quizId) {
          return {
            ...quiz,
            questions: [...quiz.questions, newQuestion],
          };
        }
        return quiz;
      })
    );
    toast({
      title: "Success",
      description: "Question added successfully"
    });
  };

  const updateQuestion = (quizId: string, updatedQuestion: Question) => {
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id === quizId) {
          return {
            ...quiz,
            questions: quiz.questions.map((question) =>
              question.id === updatedQuestion.id ? updatedQuestion : question
            ),
          };
        }
        return quiz;
      })
    );
    toast({
      title: "Success",
      description: "Question updated successfully"
    });
  };

  const deleteQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((quiz) => {
        if (quiz.id === quizId) {
          return {
            ...quiz,
            questions: quiz.questions.filter((q) => q.id !== questionId),
          };
        }
        return quiz;
      })
    );
    toast({
      title: "Success",
      description: "Question deleted successfully"
    });
  };

  const getQuiz = (id: string) => {
    return quizzes.find((quiz) => quiz.id === id);
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
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
