
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, AlignLeft } from "lucide-react";

interface QuestionActionsProps {
  onAddQuestion: () => void;
  onOpenPdfUploader: () => void;
  onOpenTextUploader: () => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  onAddQuestion,
  onOpenPdfUploader,
  onOpenTextUploader,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onAddQuestion}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Question
      </Button>

      <Button
        variant="outline"
        onClick={onOpenPdfUploader}
      >
        <FileText className="mr-2 h-4 w-4" />
        Upload PDF/Text with Questions
      </Button>

      <Button
        variant="outline"
        onClick={onOpenTextUploader}
      >
        <AlignLeft className="mr-2 h-4 w-4" />
        Paste Questions Text
      </Button>
    </div>
  );
};

export default QuestionActions;
