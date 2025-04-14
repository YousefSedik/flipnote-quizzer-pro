
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TextUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  questionText: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  isUploading: boolean;
}

const TextUploadDialog: React.FC<TextUploadDialogProps> = ({
  isOpen,
  onOpenChange,
  questionText,
  onTextChange,
  onSubmit,
  isUploading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paste Questions Text</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste text containing questions. Our system will automatically format and extract questions and answers.
          </p>
          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="question-text"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Questions Text
            </label>
            <Textarea
              id="question-text"
              placeholder="Paste your questions here..."
              className="min-h-[200px]"
              value={questionText}
              onChange={(e) => onTextChange(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSubmit}
              disabled={isUploading || !questionText.trim()}
            >
              Extract Questions
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextUploadDialog;
