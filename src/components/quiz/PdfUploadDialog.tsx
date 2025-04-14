
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface PdfUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, type: "pdf" | "book") => void;
  isUploading: boolean;
}

const PdfUploadDialog: React.FC<PdfUploadDialogProps> = ({
  isOpen,
  onOpenChange,
  onFileUpload,
  isUploading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF with Questions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a PDF file containing questions. Our system will
            automatically extract questions and answers.
          </p>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label
              htmlFor="pdf-file"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              PDF File
            </label>
            <input
              id="pdf-file"
              type="file"
              accept=".pdf"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => onFileUpload(e, "pdf")}
              disabled={isUploading}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfUploadDialog;
