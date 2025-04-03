
import React from 'react';
import { useQuizContext } from '@/context/QuizContext';
import QuizCard from '@/components/QuizCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const QuizzesPage: React.FC = () => {
  const { quizzes, isLoading, error } = useQuizContext();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load quizzes.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't created any quizzes yet.</p>
          <Link to="/create">
            <Button>Create Your First Quiz</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <Link to="/create">
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default QuizzesPage;
