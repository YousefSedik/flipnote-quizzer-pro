import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuizContext } from '@/context/QuizContext';
import QuizForm from '@/components/QuizForm';
import QuestionForm from '@/components/QuestionForm';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, ArrowLeft, FileText, Book } from 'lucide-react';
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
import { toast } from "@/hooks/use-toast";
import { Question, Option } from '@/types/quiz';

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
  const [isPdfUploaderOpen, setIsPdfUploaderOpen] = useState(false);
  const [isBookUploaderOpen, setIsBookUploaderOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isReviewingQuestions, setIsReviewingQuestions] = useState(false);
  const [currentReviewQuestion, setCurrentReviewQuestion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleQuestionFormComplete = () => {
    setIsAddingQuestion(false);
    setEditingQuestion(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'book') => {
    const file = event.target.files?.[0];
    if (!file || !id) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive"
      });
      return;
    }

    if (type === 'pdf' && file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quizId', id);
      formData.append('type', type);

      let mockQuestions: Question[] = [];
      
      if (type === 'pdf') {
        mockQuestions = [
          {
            id: `temp-${Date.now()}-1`,
            text: "What is the main topic of the uploaded PDF?",
            type: "written",
            answer: "Sample answer extracted from PDF"
          },
          {
            id: `temp-${Date.now()}-2`,
            text: "Which of the following concepts was mentioned in the PDF?",
            type: "mcq",
            answer: "Concept B",
            options: [
              { id: "1", text: "Concept A", isCorrect: false },
              { id: "2", text: "Concept B", isCorrect: true },
              { id: "3", text: "Concept C", isCorrect: false }
            ]
          }
        ];
      } else {
        mockQuestions = [
          {
            id: `temp-${Date.now()}-1`,
            text: "Who is the main character in this book?",
            type: "written",
            answer: "Character name extracted from book"
          },
          {
            id: `temp-${Date.now()}-2`,
            text: "What is the setting of this book?",
            type: "mcq",
            answer: "Setting B",
            options: [
              { id: "1", text: "Setting A", isCorrect: false },
              { id: "2", text: "Setting B", isCorrect: true },
              { id: "3", text: "Setting C", isCorrect: false }
            ]
          }
        ];
      }

      setGeneratedQuestions(mockQuestions);
      setIsReviewingQuestions(true);
      setCurrentReviewQuestion(0);
      
      setIsPdfUploaderOpen(false);
      setIsBookUploaderOpen(false);
      
      toast({
        title: "Success",
        description: `${mockQuestions.length} questions generated. Please review them before adding.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSaveGeneratedQuestion = (question: Question) => {
    if (!id) return;
    
    if (question.type === 'mcq' && question.options) {
      const correctOption = question.options.find(o => o.isCorrect);
      const correctAnswer = correctOption ? correctOption.text : '';
      
      api.quiz.questions.create(id, {
        text: question.text,
        type: 'mcq',
        answer: correctAnswer,
        options: question.options
      }).then(() => {
        toast({
          title: "Success",
          description: "Question added to quiz"
        });
      }).catch(() => {
        toast({
          title: "Error",
          description: "Failed to add question",
          variant: "destructive"
        });
      });
    } else {
      api.quiz.questions.create(id, {
        text: question.text,
        type: 'written',
        answer: question.answer
      }).then(() => {
        toast({
          title: "Success",
          description: "Question added to quiz"
        });
      }).catch(() => {
        toast({
          title: "Error",
          description: "Failed to add question",
          variant: "destructive"
        });
      });
    }
    
    if (currentReviewQuestion < generatedQuestions.length - 1) {
      setCurrentReviewQuestion(currentReviewQuestion + 1);
    } else {
      setIsReviewingQuestions(false);
      setGeneratedQuestions([]);
    }
  };

  const handleSkipQuestion = () => {
    if (currentReviewQuestion < generatedQuestions.length - 1) {
      setCurrentReviewQuestion(currentReviewQuestion + 1);
    } else {
      setIsReviewingQuestions(false);
      setGeneratedQuestions([]);
    }
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
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsAddingQuestion(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
                
                <Button variant="outline" onClick={() => setIsPdfUploaderOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
                
                <Button variant="outline" onClick={() => setIsBookUploaderOpen(true)}>
                  <Book className="mr-2 h-4 w-4" />
                  Upload Book
                </Button>
              </div>
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
                          {/* <Button  */}
                            {/* variant="outline" 
                            size="icon"
                            onClick={() => setEditingQuestion(question.id)}
                          > */}
                            {/* <Edit className="h-4 w-4" /> */}
                          {/* </Button> */}
                          
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
          
          {/* <Dialog 
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
           */}
          <Dialog open={isPdfUploaderOpen} onOpenChange={setIsPdfUploaderOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload PDF with Questions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a PDF file containing questions. Our system will automatically extract questions and answers.
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="pdf-file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    PDF File
                  </label>
                  <input
                    id="pdf-file"
                    type="file"
                    accept=".pdf"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    disabled={isUploading}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPdfUploaderOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isBookUploaderOpen} onOpenChange={setIsBookUploaderOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Book to Generate Questions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a book file (PDF, EPUB, etc). Our system will analyze the content and generate questions automatically.
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="book-file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Book File
                  </label>
                  <input
                    id="book-file"
                    type="file"
                    accept=".pdf,.epub,.mobi,.txt"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => handleFileUpload(e, 'book')}
                    disabled={isUploading}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBookUploaderOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog 
            open={isReviewingQuestions} 
            onOpenChange={(open) => !open && setIsReviewingQuestions(false)}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Review Generated Questions</DialogTitle>
              </DialogHeader>
              
              {generatedQuestions.length > 0 && currentReviewQuestion < generatedQuestions.length && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Question {currentReviewQuestion + 1} of {generatedQuestions.length}
                  </p>
                  
                  <QuestionForm 
                    quizId={quiz.id} 
                    question={generatedQuestions[currentReviewQuestion]} 
                    onComplete={() => handleSaveGeneratedQuestion(generatedQuestions[currentReviewQuestion])} 
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleSkipQuestion}
                    >
                      Skip
                    </Button>
                    <Button 
                      onClick={() => handleSaveGeneratedQuestion(generatedQuestions[currentReviewQuestion])}
                    >
                      Save & {currentReviewQuestion < generatedQuestions.length - 1 ? 'Next' : 'Finish'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default EditQuizPage;
