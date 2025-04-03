
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Library } from 'lucide-react';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Flipnote Quizzer Pro</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create interactive quizzes with flip cards. Perfect for studying and testing knowledge.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-card border rounded-lg p-8 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Create a Quiz</h2>
              <p className="text-muted-foreground mb-4">
                Build custom quizzes with multiple-choice or written answers.
              </p>
              <Link to="/create" className="mt-auto">
                <Button>Create Quiz</Button>
              </Link>
            </div>
            
            <div className="bg-card border rounded-lg p-8 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Library className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">My Quizzes</h2>
              <p className="text-muted-foreground mb-4">
                Browse, edit and play your existing quizzes.
              </p>
              <Link to="/quizzes" className="mt-auto">
                <Button variant="outline">View Quizzes</Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="p-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <h3 className="font-medium mb-1">Create a Quiz</h3>
                <p className="text-sm text-muted-foreground">
                  Build a quiz with multiple-choice or written answers
                </p>
              </div>
              
              <div className="p-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <h3 className="font-medium mb-1">Add Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Create questions and answers for your quiz
                </p>
              </div>
              
              <div className="p-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <h3 className="font-medium mb-1">Flip to Learn</h3>
                <p className="text-sm text-muted-foreground">
                  Click on cards to flip and reveal answers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
