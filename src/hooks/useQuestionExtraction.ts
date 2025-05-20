import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Question } from "@/types/quiz";
import { api } from "@/services/api";
import { AxiosError } from "axios";

interface ExtractQuestionResponse {
  mcq?: Array<{
    text: string;
    options: string[];
    answer: string;
  }>;
  written?: Array<{
    text: string;
    answer: string;
  }>;
}

export const useQuestionExtraction = (quizId: string | undefined) => {
  const [isUploading, setIsUploading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isReviewingQuestions, setIsReviewingQuestions] = useState(false);
  const [currentReviewQuestion, setCurrentReviewQuestion] = useState(0);
  const [questionText, setQuestionText] = useState("");
  
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "pdf" | "book"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !quizId) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    if (type === "pdf" && file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("quizId", quizId);
      formData.append("type", type);

      const response = await api.quiz.extractQuestions(file, quizId);
      const processedQuestions = processExtractedQuestions(response);

      if (processedQuestions.length > 0) {
        setGeneratedQuestions(processedQuestions);
        setIsReviewingQuestions(true);
        setCurrentReviewQuestion(0);

        toast({
          title: "Success",
          description: processedQuestions.length + " questions extracted. Please review them before adding.",
        });
      } else {
        toast({
          title: "Warning",
          description: "No questions could be extracted from the file.",
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      const errorMessage = error instanceof AxiosError && error.response?.data?.error
        ? error.response.data.error
        : error instanceof Error 
          ? error.message 
          : "Failed to process file. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!quizId || !questionText.trim()) {
      toast({
        title: "Error",
        description: "No text entered or invalid quiz ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const response = await api.quiz.extractQuestionsFromText(questionText, quizId);
      const processedQuestions = processExtractedQuestions(response);

      if (processedQuestions.length > 0) {
        setGeneratedQuestions(processedQuestions);
        setIsReviewingQuestions(true);
        setCurrentReviewQuestion(0);

        toast({
          title: "Success",
          description: processedQuestions.length + " questions extracted. Please review them before adding.",
        });
      } else {
        toast({
          title: "Warning",
          description: "No questions could be extracted from the text.",
        });
      }
    } catch (error) {
      console.error("Error processing text:", error);
      const errorMessage = error instanceof AxiosError && error.response?.data?.error
        ? error.response.data.error
        : error instanceof Error 
          ? error.message 
          : "Failed to process text. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setQuestionText("");
    }
  };

  const processExtractedQuestions = (data: ExtractQuestionResponse): Question[] => {
    const questions: Question[] = [];
    
    // Process MCQ questions
    if (data.mcq && Array.isArray(data.mcq)) {
      data.mcq.forEach((q, index) => {
        if (q.text && q.options && q.answer) {
          const options = q.options.map((opt, optIndex) => ({
            id: optIndex.toString(),
            text: opt,
            isCorrect: opt === q.answer,
          }));
          
          questions.push({
            id: `temp-mcq-${Date.now()}-${index}`,
            text: q.text,
            type: "mcq",
            answer: q.answer,
            options,
          });
        }
      });
    }
    
    // Process written questions
    if (data.written && Array.isArray(data.written)) {
      data.written.forEach((q, index) => {
        if (q.text && q.answer) {
          questions.push({
            id: `temp-written-${Date.now()}-${index}`,
            text: q.text,
            type: "written",
            answer: q.answer,
          });
        }
      });
    }
    
    return questions;
  };

  return {
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
  };
};
