
import React from 'react';
import QuizForm from '@/components/QuizForm';
import Header from '@/components/Header';

const CreateQuizPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
          <QuizForm />
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;
