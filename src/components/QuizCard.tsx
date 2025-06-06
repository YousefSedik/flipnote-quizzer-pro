
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quiz } from '@/types/quiz';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Play, Trash2, Link as LinkIcon, Share, User } from 'lucide-react';
import { useQuizContext } from '@/context/QuizContext';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const { deleteQuiz } = useQuizContext();
  const { authState } = useAuth();
  
  // Check if the current user is the owner of the quiz
  // Use the email as an identifier since username doesn't exist'
  const isOwner = authState.user?.username === quiz.ownerUsername;
  
  const copyLinkToClipboard = () => {
    const url = `${window.location.origin}/quiz/${quiz.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Quiz link copied to clipboard"
    });
  };

  const shareQuiz = async () => {
    const url = `${window.location.origin}/quiz/${quiz.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz.title,
          text: quiz.description || 'Check out this quiz!',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyLinkToClipboard();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.is_public && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Public
            </span>
          )}
          {!quiz.is_public && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              Private
            </span>
          )}
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {quiz.ownerUsername || 'Unknown user'}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Created {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  quiz and all its questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!isOwner && <div />}
        
        <div className="flex gap-2">
          {quiz.is_public && (
            <>
              <Button variant="outline" size="icon" onClick={copyLinkToClipboard} title="Copy Link">
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={shareQuiz} title="Share Quiz">
                <Share className="h-4 w-4" />
              </Button>
            </>
          )}
          {isOwner && (
            <Link to={`/quiz/${quiz.id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link to={`/quiz/${quiz.id}`}>
            <Button size="icon">
              <Play className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
