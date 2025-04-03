
import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuizContext } from '@/context/QuizContext';
import QuizForm from '@/components/QuizForm';
import QuestionForm from '@/components/QuestionForm';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
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

const EditQuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteQuestion } = useQuizContext();
  
  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => id ? api.quiz.getOne(id) : Promise.reject('No quiz ID provided'),
    enabled: !!id,
  });
  
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const handleQuestionFormComplete = () => {
    setIsAddingQuestion(false);
    setEditingQuestion(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <Skeleton className="h-[300px] w-full mb-8" />
            <Skeleton className="h-8 w-[200px] mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[80px] w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz || !id) {
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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/quiz/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Quiz</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Quiz Details</h2>
            <Card>
              <CardContent className="pt-6">
                <QuizForm quiz={quiz} />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
              <h2 className="text-lg font-medium">Questions</h2>
              <Button onClick={() => setIsAddingQuestion(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
            
            {quiz.questions.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground mb-4">No questions added yet.</p>
                <Button onClick={() => setIsAddingQuestion(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quiz.questions.map((question) => (
                  <Card key={question.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between flex-col sm:flex-row gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{question.text}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {question.type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
                          </p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setEditingQuestion(question.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this question.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteQuestion(quiz.id, question.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Question Dialog */}
          <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
              </DialogHeader>
              <QuestionForm 
                quizId={quiz.id} 
                onComplete={handleQuestionFormComplete} 
              />
            </DialogContent>
          </Dialog>
          
          {/* Edit Question Dialog */}
          <Dialog 
            open={!!editingQuestion} 
            onOpenChange={(open) => !open && setEditingQuestion(null)}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Question</DialogTitle>
              </DialogHeader>
              {editingQuestion && (
                <QuestionForm 
                  quizId={quiz.id} 
                  question={quiz.questions.find(q => q.id === editingQuestion)} 
                  onComplete={handleQuestionFormComplete} 
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EditQuizPage;
