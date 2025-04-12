
export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type QuestionType = 'mcq' | 'written';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  answer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  is_public: boolean;
  questions: Question[];
  ownerUsername: string;
  last_accessed?: string; // Added for history items
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Add this type to fix the create quiz API
export interface CreateQuizParams {
  title: string;
  description: string;
  is_public: boolean;
}
