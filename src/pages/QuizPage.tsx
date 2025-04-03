
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useQuizContext } from '@/context/QuizContext';
import FlipCard from '@/components/FlipCard';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { ArrowLeft, Edit, Link as LinkIcon, Share, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuiz } = useQuizContext();
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  
  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => id ? api.quiz.getOne(id) : Promise.reject('No quiz ID provided'),
    enabled: !!id,
  });
  
  useEffect(() => {
    if (quiz?.questions) {
      setShuffledQuestions([...quiz.questions]);
    }
  }, [quiz]);

  const shuffleQuestions = () => {
    if (!quiz?.questions) return;
    setShuffledQuestions([...quiz.questions].sort(() => Math.random() - 0.5));
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Quiz link copied to clipboard"
    });
  };

  const shareQuiz = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz?.title || 'Quiz',
          text: quiz?.description || 'Check out this quiz!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyLinkToClipboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <Skeleton className="h-4 w-full max-w-md mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive mb-4">Failed to load quiz.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={() => navigate('/quizzes')}>
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/quizzes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.isPublic && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Public
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-end">
            {quiz.isPublic && (
              <>
                <Button variant="outline" size="sm" onClick={copyLinkToClipboard} title="Copy Link">
                  <LinkIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Copy Link</span>
                </Button>
                <Button variant="outline" size="sm" onClick={shareQuiz} title="Share Quiz">
                  <Share className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={shuffleQuestions}>
              Shuffle
            </Button>
            <Link to={`/quiz/${quiz.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {quiz.description && (
          <p className="text-muted-foreground mb-8">{quiz.description}</p>
        )}
        
        {shuffledQuestions.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">This quiz doesn't have any questions yet.</p>
            <Link to={`/quiz/${quiz.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Quiz
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shuffledQuestions.map((question) => (
              <FlipCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
