
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";
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
import { Question } from "@/types/quiz";

interface QuestionsListProps {
  questions: Question[];
  quizId: string;
  onDeleteQuestion: (quizId: string, questionId: string) => void;
  onAddQuestion: () => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  quizId,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground mb-4">
          No questions added yet.
        </p>
        <Button onClick={onAddQuestion}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Your First Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {question.text}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {question.type === "mcq"
                    ? "Multiple Choice"
                    : "Written Answer"}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Question?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will
                        permanently delete this question.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          onDeleteQuestion(quizId, question.id)
                        }
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
  );
};

export default QuestionsList;
