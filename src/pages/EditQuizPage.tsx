import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuizContext } from "@/context/QuizContext";
import QuizForm from "@/components/QuizForm";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Question } from "@/types/quiz";
import { useQuestionExtraction } from "@/hooks/useQuestionExtraction";
import QuestionsList from "@/components/quiz/QuestionsList";
import QuestionActions from "@/components/quiz/QuestionActions";
import PdfUploadDialog from "@/components/quiz/PdfUploadDialog";
import TextUploadDialog from "@/components/quiz/TextUploadDialog";
import AddQuestionDialog from "@/components/quiz/AddQuestionDialog";
import QuestionReviewDialog from "@/components/quiz/QuestionReviewDialog";
import { toast } from "@/hooks/use-toast";

const EditQuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { deleteQuestion } = useQuizContext();

  const {
    data: quiz,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quizzes", id],
    queryFn: () =>
      id ? api.quiz.getOne(id) : Promise.reject("No quiz ID provided"),
    enabled: !!id,
  });

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isPdfUploaderOpen, setIsPdfUploaderOpen] = useState(false);
  const [isTextUploaderOpen, setIsTextUploaderOpen] = useState(false);

  const {
    isUploading,
    generatedQuestions,
    isReviewingQuestions,
    setIsReviewingQuestions,
    currentReviewQuestion,
    setCurrentReviewQuestion,
    questionText,
    setQuestionText,
    handleFileUpload,
    handleTextSubmit,
  } = useQuestionExtraction(id);

  const handleQuestionFormComplete = async (question: Question) => {
    if (!id) return;

    try {
      if (question.type === "mcq" && question.options) {
        const correctOption = question.options.find((o) => o.isCorrect);
        const correctAnswer = correctOption ? correctOption.text : "";

        await api.quiz.questions.create(id, {
          text: question.text,
          type: "mcq",
          answer: correctAnswer,
          options: question.options,
        });

        toast({
          title: "Success",
          description: "Question added to quiz",
        });
      } else {
        await api.quiz.questions.create(id, {
          text: question.text,
          type: "written",
          answer: question.answer,
        });

        toast({
          title: "Success",
          description: "Question added to quiz",
        });
      }

      await refetch();
      setIsAddingQuestion(false);
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleSaveGeneratedQuestion = async (question: Question) => {
    if (!id) return;

    try {
      if (question.type === "mcq" && question.options) {
        const correctOption = question.options.find((o) => o.isCorrect);
        const correctAnswer = correctOption ? correctOption.text : "";

        await api.quiz.questions.create(id, {
          text: question.text,
          type: "mcq",
          answer: correctAnswer,
          options: question.options,
        });

        toast({
          title: "Success",
          description: "Question added to quiz",
        });
      } else {
        await api.quiz.questions.create(id, {
          text: question.text,
          type: "written",
          answer: question.answer,
        });

        toast({
          title: "Success",
          description: "Question added to quiz",
        });
      }

      await refetch();

      if (currentReviewQuestion < generatedQuestions.length - 1) {
        setCurrentReviewQuestion(currentReviewQuestion + 1);
      } else {
        setIsReviewingQuestions(false);
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleSkipQuestion = () => {
    if (currentReviewQuestion < generatedQuestions.length - 1) {
      setCurrentReviewQuestion(currentReviewQuestion + 1);
    } else {
      setIsReviewingQuestions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-6 sm:h-8 w-[150px] sm:w-[200px] mb-4 sm:mb-6" />
            <Skeleton className="h-[200px] sm:h-[300px] w-full mb-6 sm:mb-8" />
            <Skeleton className="h-6 sm:h-8 w-[150px] sm:w-[200px] mb-3 sm:mb-4" />
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[60px] sm:h-[80px] w-full" />
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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 text-center">
          <p className="text-sm sm:text-base text-destructive mb-4">Failed to load quiz.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button className="h-9 sm:h-10 text-sm sm:text-base" onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" className="h-9 sm:h-10 text-sm sm:text-base" onClick={() => navigate("/quizzes")}>
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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/quiz/${id}`)}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Edit Quiz</h1>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Quiz Details</h2>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <QuizForm quiz={quiz} />
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 sm:mb-4 flex-col sm:flex-row gap-2">
              <h2 className="text-base sm:text-lg font-medium">Questions</h2>
              <QuestionActions 
                onAddQuestion={() => setIsAddingQuestion(true)}
                onOpenPdfUploader={() => setIsPdfUploaderOpen(true)}
                onOpenTextUploader={() => setIsTextUploaderOpen(true)}
              />
            </div>

            <QuestionsList 
              questions={quiz.questions}
              quizId={quiz.id}
              onDeleteQuestion={deleteQuestion}
              onAddQuestion={() => setIsAddingQuestion(true)}
            />
          </div>

          <AddQuestionDialog 
            isOpen={isAddingQuestion}
            onOpenChange={setIsAddingQuestion}
            quizId={quiz.id}
            onComplete={handleQuestionFormComplete}
          />

          <PdfUploadDialog 
            isOpen={isPdfUploaderOpen}
            onOpenChange={setIsPdfUploaderOpen}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />

          <TextUploadDialog 
            isOpen={isTextUploaderOpen}
            onOpenChange={setIsTextUploaderOpen}
            questionText={questionText}
            onTextChange={setQuestionText}
            onSubmit={handleTextSubmit}
            isUploading={isUploading}
          />

          {generatedQuestions.length > 0 && (
            <QuestionReviewDialog 
              isOpen={isReviewingQuestions}
              onOpenChange={setIsReviewingQuestions}
              generatedQuestions={generatedQuestions}
              currentQuestionIndex={currentReviewQuestion}
              quizId={quiz.id}
              onSaveQuestion={handleSaveGeneratedQuestion}
              onSkipQuestion={handleSkipQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuizPage;
