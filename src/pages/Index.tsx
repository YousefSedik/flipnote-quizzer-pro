
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, List, LogIn, UserPlus } from 'lucide-react';

const Index = () => {
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
        <div className="space-y-6 max-w-3xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            Create and Share Interactive Quizzes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Engage learners with interactive flashcard quizzes that are fun and effective.
            Perfect for students, teachers, and anyone looking to learn something new.
          </p>
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
      </main>
    </div>
  );
};

export default Index;
