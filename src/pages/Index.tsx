
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, List, LogIn, UserPlus, Share, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import QuizCard from '@/components/QuizCard';
import QuizPagination from '@/components/QuizPagination';
import { PaginationParams } from '@/types/quiz';
import SearchSection from '@/components/SearchSection';
import HistorySection from '@/components/HistorySection';

const Index = () => {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  const [page, setPage] = useState(1);
  const pageSize = 6; // Number of quizzes per page
  const [searchQuery, setSearchQuery] = useState('');

  const { data: publicQuizzesData, isLoading } = useQuery({
    queryKey: ['publicQuizzes', page, pageSize, searchQuery],
    queryFn: () => api.quiz.public.getAll(page, pageSize),
    // Only fetch if API is available, avoiding unnecessary API calls during development
    retry: 1,
    retryDelay: 1000,
  });

  const publicQuizzes = publicQuizzesData?.results || [];
  const totalItems = publicQuizzesData?.count || 0;
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isAuthenticated ? (
          <div className="space-y-8">
            <SearchSection onSearch={handleSearch} />
            <HistorySection />
          </div>
        ) : (
          <section className="flex flex-col items-center justify-center text-center py-12 md:py-20">
            <div className="space-y-6 max-w-3xl px-4">
              <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
                Create and Share Interactive Quizzes
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Engage learners with interactive flashcard quizzes that are fun and effective.
                Perfect for students, teachers, and anyone looking to learn something new.
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 w-full sm:w-auto">
                  <Share className="h-5 w-5 text-green-600 mr-2" />
                  <span>Make quizzes public or private</span>
                </div>
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 w-full sm:w-auto">
                  <PlusCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Create custom flashcards</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2">
                    <UserPlus className="h-5 w-5" />
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <LogIn className="h-5 w-5" />
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {!isLoading && publicQuizzes.length > 0 && (
          <section className="py-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Public Quizzes
              </h2>
              {totalItems > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing {publicQuizzes.length} of {totalItems} quizzes
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <QuizPagination 
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
