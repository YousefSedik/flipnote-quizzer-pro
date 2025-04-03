
import React from 'react';
import { useQuizContext } from '@/context/QuizContext';
import QuizCard from '@/components/QuizCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const QuizzesPage: React.FC = () => {
  const { quizzes } = useQuizContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <Link to="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't created any quizzes yet.</p>
            <Link to="/create">
              <Button>Create Your First Quiz</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
