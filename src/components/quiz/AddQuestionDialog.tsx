
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuestionForm from "@/components/QuestionForm";

interface AddQuestionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  onComplete: () => void;
}

const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  isOpen,
  onOpenChange,
  quizId,
  onComplete,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <QuestionForm
          quizId={quizId}
          onComplete={onComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionDialog;
