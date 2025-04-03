
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, List, LogIn, UserPlus, Share, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import QuizCard from '@/components/QuizCard';

const Index = () => {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;

  const { data: publicQuizzes = [] } = useQuery({
    queryKey: ['publicQuizzes'],
    queryFn: api.quiz.public.getAll,
    enabled: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
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
              {isAuthenticated ? (
                <>
                  <Link to="/create" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full gap-2">
                      <PlusCircle className="h-5 w-5" />
                      Create a Quiz
                    </Button>
                  </Link>
                  <Link to="/quizzes" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full gap-2">
                      <List className="h-5 w-5" />
                      View My Quizzes
                    </Button>
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </section>

        {publicQuizzes.length > 0 && (
          <section className="py-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Public Quizzes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicQuizzes.slice(0, 6).map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
