import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import SearchSection from '@/components/SearchSection';
import HistorySection from '@/components/HistorySection';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Index: React.FC = () => {
  const { authState } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: publicQuizzes, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['publicQuizzes', searchQuery],
    queryFn: () => searchQuery ? api.quiz.search(searchQuery) : api.quiz.public.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {authState.isAuthenticated ? (
          <div className="space-y-8 sm:space-y-12">
            <div className="space-y-4">
              <SearchSection onSearch={handleSearch} />
              
              {/* Search Results Section */}
              {searchQuery && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold">Search Results</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                      className="text-sm"
                    >
                      Clear Search
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {isLoadingQuizzes ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-3 sm:p-4 animate-pulse">
                          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-full mb-4"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-8 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      ))
                    ) : publicQuizzes?.results.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">
                          No quizzes found matching your search.
                        </p>
                      </div>
                    ) : (
                      publicQuizzes?.results.map((quiz) => (
                        <div key={quiz.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-medium text-base sm:text-lg">{quiz.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 sm:mb-4">
                            {quiz.description || 'No description'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {quiz.views_count} views
                            </span>
                            <Link to={`/quiz/${quiz.id}`}>
                              <Button size="sm">View Quiz</Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* History Section */}
              {!searchQuery && <HistorySection />}
              
              {/* Public Quizzes Section */}
              {!searchQuery && (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Public Quizzes</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {isLoadingQuizzes ? (
                      // Loading skeleton
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-3 sm:p-4 animate-pulse">
                          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-full mb-4"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-8 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      ))
                    ) : publicQuizzes?.results.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">
                          No public quizzes available.
                        </p>
                      </div>
                    ) : (
                      publicQuizzes?.results.map((quiz) => (
                        <div key={quiz.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-medium text-base sm:text-lg">{quiz.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 sm:mb-4">
                            {quiz.description || 'No description'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {quiz.views_count} views
                            </span>
                            <Link to={`/quiz/${quiz.id}`}>
                              <Button size="sm">View Quiz</Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 py-8 sm:py-12 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold">Create and Share Interactive Quizzes</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Engage your audience with fun, interactive quizzes that make learning enjoyable.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 py-4 sm:py-6">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Create Account</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
