
import React from 'react';
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
  
  const { data: publicQuizzes } = useQuery({
    queryKey: ['publicQuizzes'],
    queryFn: () => api.quiz.public.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {authState.isAuthenticated ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SearchSection />
              <HistorySection />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Public Quizzes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicQuizzes?.results.map((quiz) => (
                  <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-lg">{quiz.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {quiz.description || 'No description'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {quiz.questions.length} questions
                      </span>
                      <Link to={`/quiz/${quiz.id}`}>
                        <Button size="sm">View Quiz</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center space-y-6 py-12">
            <h1 className="text-4xl font-bold">Create and Share Interactive Quizzes</h1>
            <p className="text-xl text-muted-foreground">
              Engage your audience with fun, interactive quizzes that make learning enjoyable.
            </p>
            
            <div className="flex justify-center gap-4 py-6">
              <Link to="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Create Account</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
