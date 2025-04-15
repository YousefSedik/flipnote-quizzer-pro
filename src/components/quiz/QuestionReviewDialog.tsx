
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuestionForm from "@/components/QuestionForm";
import { Question } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";

interface QuestionReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generatedQuestions: Question[];
  currentQuestionIndex: number;
  quizId: string;
  onSaveQuestion: (question: Question) => void;
  onSkipQuestion: () => void;
}

const QuestionReviewDialog: React.FC<QuestionReviewDialogProps> = ({
  isOpen,
  onOpenChange,
  generatedQuestions,
  currentQuestionIndex,
  quizId,
  onSaveQuestion,
  onSkipQuestion,
}) => {
  const totalQuestions = generatedQuestions.length;
  const currentQuestion = generatedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  if (!currentQuestion) {
    // If there's no current question, close the dialog
    if (isOpen) {
      toast({
        title: "Complete",
        description: "All questions have been reviewed.",
      });
      onOpenChange(false);
    }
    return null;
  }

  const handleSave = () => {
    // Save the current question
    onSaveQuestion(currentQuestion);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onOpenChange(open)}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Generated Questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>

          <QuestionForm
            quizId={quizId}
            question={currentQuestion}
            onComplete={handleSave}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={onSkipQuestion}>
              Skip
            </Button>
            <Button onClick={handleSave}>
              Save & {isLastQuestion ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionReviewDialog;
