import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question, QuestionType, Option } from "@/types/quiz";
import { useQuizContext } from "@/context/QuizContext";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface QuestionFormProps {
  quizId: string;
  question?: Question;
  onComplete: (question: Question) => void;
  isReviewMode?: boolean;
}



const QuestionForm: React.FC<QuestionFormProps> = ({
  quizId,
  question,
  onComplete,
  isReviewMode = false,
}) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("written");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: uuidv4(), text: "", isCorrect: false },
    { id: uuidv4(), text: "", isCorrect: false },
  ]);

  const { addQuestion, updateQuestion } = useQuizContext();

  // Update onComplete whenever any field changes in review mode
  useEffect(() => {
    if (question) {
      setQuestionText(question.text || "");
      setQuestionType(question.type || "written");
      setAnswer(question.answer || "");
      setOptions(
        question.options || [
          { id: uuidv4(), text: "", isCorrect: false },
          { id: uuidv4(), text: "", isCorrect: false },
        ]
      );
    }
  }, [question]);

  // Function to update the parent component with the latest question data
  const updateQuestionData = () => {
    if (questionType === "mcq") {
      const correctOption = options.find((o) => o.isCorrect);
      const correctAnswer = correctOption ? correctOption.text : "";

      onComplete({
        id: question?.id || `temp-mcq-${Date.now()}`,
        text: questionText,
        type: "mcq",
        answer: correctAnswer,
        options: options,
      });
    } else {
      onComplete({
        id: question?.id || `temp-written-${Date.now()}`,
        text: questionText,
        type: "written",
        answer: answer,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (questionType === "mcq") {
      // Check if at least 2 options
      if (options.length < 2) {
        toast({
          title: "Error",
          description: "Please add at least 2 options",
          variant: "destructive",
        });
        return;
      }

      // Check if any empty options
      if (options.some((option) => !option.text.trim())) {
        toast({
          title: "Error",
          description: "Please fill in all options",
          variant: "destructive",
        });
        return;
      }

      // Check if at least one correct answer
      if (!options.some((option) => option.isCorrect)) {
        toast({
          title: "Error",
          description: "Please select at least one correct answer",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!answer.trim()) {
        toast({
          title: "Error",
          description: "Please provide an answer",
          variant: "destructive",
        });
        return;
      }
    }

    // Call updateQuestionData to ensure the latest data is passed
    updateQuestionData();

    // If not in review mode, we can also call onComplete as a function without parameters
    if (!isReviewMode && typeof onComplete === "function") {
      onComplete();
    }
  };

  const addOption = () => {
    setOptions([...options, { id: uuidv4(), text: "", isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: "Error",
        description: "You need at least 2 options",
        variant: "destructive",
      });
      return;
    }
    setOptions(options.filter((option) => option.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(
      options.map((option) => (option.id === id ? { ...option, text } : option))
    );
  };

  const toggleCorrect = (id: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, isCorrect: !option.isCorrect } : option
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="questionText"
          className="block text-sm font-medium mb-1"
        >
          Question
        </label>
        <Textarea
          id="questionText"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          required
        />
      </div>

      {!isReviewMode && (
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">
            Question Type
          </label>
          <RadioGroup
            value={questionType}
            onValueChange={(value) => setQuestionType(value as QuestionType)}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="written" id="written" />
              <Label htmlFor="written">Written Answer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mcq" id="mcq" />
              <Label htmlFor="mcq">Multiple Choice</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {questionType === "written" ? (
        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-1">
            Answer
          </label>
          <Textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the answer"
            required={questionType === "written"}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Options (check the correct answer(s))
          </label>
          {options.map((option, index) => (
            <Card key={option.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                    option.isCorrect
                      ? "bg-primary text-primary-foreground"
                      : "border border-input"
                  }`}
                  onClick={() => toggleCorrect(option.id)}
                >
                  {option.isCorrect && <span>✓</span>}
                </div>
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addOption}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}

      {!isReviewMode && (
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onComplete()}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {question ? "Update Question" : "Add Question"}
          </Button>
        </div>
      )}
    </div>
  );
};
export default QuestionForm;
