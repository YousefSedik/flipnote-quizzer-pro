
export type QuestionType = 'mcq' | 'written';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answer: string;
  options?: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  isPublic: boolean; // New field to track public/private status
}
