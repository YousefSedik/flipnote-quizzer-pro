import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import QuizCard from '@/components/QuizCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import QuizPagination from '@/components/QuizPagination';
import { PaginationParams } from '@/types/quiz';
import { useAuth } from '@/context/AuthContext';

const QuizzesPage: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 9; // Number of quizzes per page

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/login');
    }
  }, [authState.isAuthenticated, navigate]);

  const { data: quizzesData, isLoading, error } = useQuery({
    queryKey: ['quizzes', page, pageSize],
    queryFn: () => api.quiz.getAll(page, pageSize),
    enabled: authState.isAuthenticated, // Only run query if authenticated
  });

  const quizzes = quizzesData?.results || [];
  const totalItems = quizzesData?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const pagination: PaginationParams = {
    page,
    pageSize,
    totalItems,
    totalPages,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not authenticated, don't render content while redirect happens
  if (!authState.isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-2 sm:space-y-3">
              <Skeleton className="h-[100px] sm:h-[125px] w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-3 sm:h-4 w-[200px] sm:w-[250px]" />
                <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-destructive mb-4">Failed to load quizzes.</p>
          <Button className="h-9 sm:h-10 text-sm sm:text-base" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">You haven't created any quizzes yet.</p>
          <Link to="/create">
            <Button className="h-9 sm:h-10 text-sm sm:text-base">Create Your First Quiz</Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-6 sm:mt-8">
            <QuizPagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6 flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">My Quizzes</h1>
            {totalItems > 0 && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({totalItems} total)
              </span>
            )}
          </div>
          <Link to="/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
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
