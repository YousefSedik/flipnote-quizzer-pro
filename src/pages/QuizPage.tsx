
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuizContext } from '@/context/QuizContext';
import FlipCard from '@/components/FlipCard';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { ArrowLeft, Edit, Link as LinkIcon, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getQuiz } = useQuizContext();
  const quiz = getQuiz(id || '');
  const [shuffledQuestions, setShuffledQuestions] = useState<typeof quiz.questions>([]);
  
  useEffect(() => {
    if (quiz) {
      setShuffledQuestions([...quiz.questions]);
    }
  }, [quiz]);

  const shuffleQuestions = () => {
    if (!quiz) return;
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

  if (!quiz) {
    return <Navigate to="/quizzes" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
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
          <div className="flex gap-2">
            {quiz.isPublic && (
              <>
                <Button variant="outline" size="icon" onClick={copyLinkToClipboard} title="Copy Link">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareQuiz} title="Share Quiz">
                  <Share className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" onClick={shuffleQuestions}>
              Shuffle
            </Button>
            <Link to={`/quiz/${quiz.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
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
